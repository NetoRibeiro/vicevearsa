import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
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

function discoverDepartmens(departmensDir: string): DepartmenInfo[] {
  if (!fs.existsSync(departmensDir)) return [];

  const entries = fs.readdirSync(departmensDir, { withFileTypes: true });
  const departmens: DepartmenInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(departmensDir, entry.name, "departmen.yaml");
    if (fs.existsSync(yamlPath)) {
      try {
        const raw = fs.readFileSync(yamlPath, "utf-8");
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
        // Fall through to default
      }
    }

    // No departmen.yaml or invalid YAML — use directory name as fallback
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

function readActiveStates(departmensDir: string): Record<string, DepartmenState> {
  const states: Record<string, DepartmenState> = {};
  if (!fs.existsSync(departmensDir)) return states;

  const entries = fs.readdirSync(departmensDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.join(departmensDir, entry.name, "state.json");
    if (!fs.existsSync(statePath)) continue;

    try {
      const raw = fs.readFileSync(statePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) {
        states[entry.name] = parsed;
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return states;
}

function buildSnapshot(departmensDir: string): WsMessage {
  return {
    type: "SNAPSHOT",
    departmens: discoverDepartmens(departmensDir),
    activeStates: readActiveStates(departmensDir),
  };
}

function broadcast(wss: WebSocketServer, msg: WsMessage) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

export function departmenWatcherPlugin(): Plugin {
  return {
    name: "departmen-watcher",
    configureServer(server: ViteDevServer) {
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
      wss.on("connection", (ws) => {
        ws.send(JSON.stringify(buildSnapshot(departmensDir)));
      });

      // Ensure departmens directory exists
      if (!fs.existsSync(departmensDir)) {
        fs.mkdirSync(departmensDir, { recursive: true });
      }

      // Watch state.json files using Vite's built-in chokidar watcher
      const stateGlob = path.join(departmensDir, "*/state.json").replace(/\\/g, "/");
      server.watcher.add(stateGlob);

      // Debounce timers per departmen to avoid reading partial writes
      const changeTimers = new Map<string, ReturnType<typeof setTimeout>>();

      // Also watch for new departmen.yaml files
      const yamlGlob = path.join(departmensDir, "*/departmen.yaml").replace(/\\/g, "/");
      server.watcher.add(yamlGlob);

      server.watcher.on("add", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const departmenName = extractDepartmenName(filePath, departmensDir);
          if (!departmenName) return;
          clearTimeout(changeTimers.get(departmenName));
          changeTimers.set(departmenName, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: DepartmenState = JSON.parse(raw);
              broadcast(wss, { type: "DEPARTMEN_ACTIVE", departmen: departmenName, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("departmen.yaml")) {
          broadcast(wss, buildSnapshot(departmensDir));
        }
      });

      server.watcher.on("change", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const departmenName = extractDepartmenName(filePath, departmensDir);
          if (!departmenName) return;
          clearTimeout(changeTimers.get(departmenName));
          changeTimers.set(departmenName, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: DepartmenState = JSON.parse(raw);
              broadcast(wss, { type: "DEPARTMEN_UPDATE", departmen: departmenName, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("departmen.yaml")) {
          broadcast(wss, buildSnapshot(departmensDir));
        }
      });

      server.watcher.on("unlink", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const departmenName = extractDepartmenName(filePath, departmensDir);
          if (!departmenName) return;
          clearTimeout(changeTimers.get(departmenName));
          changeTimers.delete(departmenName);
          broadcast(wss, { type: "DEPARTMEN_INACTIVE", departmen: departmenName });
        } else if (filePath.endsWith("departmen.yaml")) {
          broadcast(wss, buildSnapshot(departmensDir));
        }
      });
    },
  };
}

function extractDepartmenName(filePath: string, departmensDir: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const normalizedBase = departmensDir.replace(/\\/g, "/");
  const relative = normalized.replace(normalizedBase + "/", "");
  const parts = relative.split("/");
  return parts.length >= 2 ? parts[0] : null;
}
