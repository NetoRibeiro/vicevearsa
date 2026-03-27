import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { watch as chokidarWatch } from "chokidar";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { DepartmenInfo, DepartmenState, WsMessage } from "../types/state";

function resolveDepartmensDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../departmens"),  // started from dashboard/
    path.resolve(process.cwd(), "departmens"),     // started from project root
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "../departmens"); // default (will be created on demand)
}

async function discoverDepartmens(departmensDir: string): Promise<DepartmenInfo[]> {
  let entries;
  try {
    entries = await fsp.readdir(departmensDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const departmens: DepartmenInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(departmensDir, entry.name, "departmen.yaml");
    try {
      const raw = await fsp.readFile(yamlPath, "utf-8");
      const parsed = parseYaml(raw);
      const s = parsed?.departmen;
      if (s) {
        departmens.push({
          code: typeof s.code === "string" ? s.code : entry.name,
          name: typeof s.name === "string" ? s.name : entry.name,
          description: typeof s.description === "string" ? s.description : "",
          icon: typeof s.icon === "string" ? s.icon : "\u{1F4CB}",
          agents: Array.isArray(s.agents) ? (s.agents as unknown[]).filter((a): a is string => typeof a === "string") : [],
        });
        continue;
      }
    } catch {
      // No departmen.yaml or invalid YAML — fall through to default
    }

    departmens.push({
      code: entry.name,
      name: entry.name,
      description: "",
      icon: "\u{1F4CB}",
      agents: [],
    });
  }

  return departmens;
}

function isValidState(data: unknown): data is DepartmenState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.status === "string" &&
    d.step != null && typeof d.step === "object" &&
    Array.isArray(d.agents)
  );
}

async function readActiveStates(departmensDir: string): Promise<Record<string, DepartmenState>> {
  const states: Record<string, DepartmenState> = {};

  let entries;
  try {
    entries = await fsp.readdir(departmensDir, { withFileTypes: true });
  } catch {
    return states;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.join(departmensDir, entry.name, "state.json");

    try {
      const raw = await fsp.readFile(statePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) {
        states[entry.name] = parsed;
      }
    } catch {
      // Skip missing or invalid JSON
    }
  }

  return states;
}

async function buildSnapshot(departmensDir: string): Promise<WsMessage> {
  return {
    type: "SNAPSHOT",
    departmens: await discoverDepartmens(departmensDir),
    activeStates: await readActiveStates(departmensDir),
  };
}

function broadcast(wss: WebSocketServer, msg: WsMessage) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch {
        // Client connection dying — ws library will clean it up
      }
    }
  }
}

export function departmenWatcherPlugin(): Plugin {
  return {
    name: "departmen-watcher",
    configureServer(server: ViteDevServer) {
      if (!server.httpServer) {
        server.config.logger.warn("[departmen-watcher] no httpServer — skipping");
        return;
      }

      const departmensDir = resolveDepartmensDir();
      server.config.logger.info(`[departmen-watcher] departmens dir: ${departmensDir}`);

      // Create WebSocket server with noServer to avoid intercepting Vite's HMR
      const wss = new WebSocketServer({ noServer: true });
      (server.httpServer as Server).on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        if (req.url === "/__departmens_ws") {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
          });
        }
        // Let Vite handle all other upgrade requests (HMR)
      });

      // Send snapshot on new connection
      wss.on("connection", async (ws) => {
        try {
          const snap = await buildSnapshot(departmensDir);
          ws.send(JSON.stringify(snap));
        } catch {
          // Connection may have closed before snapshot was ready
        }
      });

      // Ensure departmens directory exists
      fsp.mkdir(departmensDir, { recursive: true }).catch((err) => {
        server.config.logger.error(`[departmen-watcher] failed to create departmens dir: ${err.message}`);
      });

      // REST API fallback — serves snapshot over HTTP for polling clients
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/api/snapshot") return next();
        try {
          const snapshot = await buildSnapshot(departmensDir);
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-cache");
          res.end(JSON.stringify(snapshot));
        } catch {
          res.writeHead(500);
          res.end("Internal Server Error");
        }
      });

      // File watcher using chokidar — reliable cross-platform, handles partial writes
      const watcher = chokidarWatch(departmensDir, {
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 50 },
        ignored: [/(^|[/\\])\./, /node_modules/, /output[/\\]/],
        depth: 2,
      });

      function handleFileChange(filePath: string) {
        const relative = path.relative(departmensDir, filePath).replace(/\\/g, "/");
        const parts = relative.split("/");
        if (parts.length < 2) return;

        const departmenName = parts[0];
        const fileName = parts[1];

        if (fileName === "state.json") {
          fsp.readFile(filePath, "utf-8").then((raw) => {
            const parsed = JSON.parse(raw);
            if (!isValidState(parsed)) return;
            broadcast(wss, { type: "DEPARTMEN_UPDATE", departmen: departmenName, state: parsed });
          }).catch(() => {
            // Invalid JSON — next change event will retry
          });
        } else if (fileName === "departmen.yaml") {
          buildSnapshot(departmensDir).then((snap) => broadcast(wss, snap));
        }
      }

      function handleFileRemoval(filePath: string) {
        const relative = path.relative(departmensDir, filePath).replace(/\\/g, "/");
        const parts = relative.split("/");
        if (parts.length < 2) return;

        const departmenName = parts[0];
        const fileName = parts[1];

        if (fileName === "state.json") {
          broadcast(wss, { type: "DEPARTMEN_INACTIVE", departmen: departmenName });
        } else if (fileName === "departmen.yaml") {
          buildSnapshot(departmensDir).then((snap) => broadcast(wss, snap));
        }
      }

      watcher.on("add", handleFileChange);
      watcher.on("change", handleFileChange);
      watcher.on("unlink", handleFileRemoval);

      server.httpServer.on("close", () => {
        watcher.close();
      });
    },
  };
}

