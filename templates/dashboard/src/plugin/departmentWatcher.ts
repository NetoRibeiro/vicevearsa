import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { DepartmentInfo, DepartmentState, WsMessage } from "../types/state";

function resolveDepartmentsDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../departments"),  // started from dashboard/
    path.resolve(process.cwd(), "departments"),     // started from project root
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "../departments"); // default (will be created on demand)
}

function discoverDepartments(departmentsDir: string): DepartmentInfo[] {
  if (!fs.existsSync(departmentsDir)) return [];

  const entries = fs.readdirSync(departmentsDir, { withFileTypes: true });
  const departments: DepartmentInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(departmentsDir, entry.name, "department.yaml");
    if (fs.existsSync(yamlPath)) {
      try {
        const raw = fs.readFileSync(yamlPath, "utf-8");
        const parsed = parseYaml(raw);
        const s = parsed?.department;
        if (s) {
          departments.push({
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

    // No department.yaml or invalid YAML — use directory name as fallback
    departments.push({
      code: entry.name,
      name: entry.name,
      description: "",
      icon: "\u{1F4CB}",
      agents: [],
    });
  }

  return departments;
}

function isValidState(data: unknown): data is DepartmentState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.status === "string" &&
    d.step != null && typeof d.step === "object" &&
    Array.isArray(d.agents)
  );
}

function readActiveStates(departmentsDir: string): Record<string, DepartmentState> {
  const states: Record<string, DepartmentState> = {};
  if (!fs.existsSync(departmentsDir)) return states;

  const entries = fs.readdirSync(departmentsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.join(departmentsDir, entry.name, "state.json");
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

function buildSnapshot(departmentsDir: string): WsMessage {
  return {
    type: "SNAPSHOT",
    departments: discoverDepartments(departmentsDir),
    activeStates: readActiveStates(departmentsDir),
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

export function departmentWatcherPlugin(): Plugin {
  return {
    name: "department-watcher",
    configureServer(server: ViteDevServer) {
      const departmentsDir = resolveDepartmentsDir();
      server.config.logger.info(`[department-watcher] departments dir: ${departmentsDir}`);

      // Create WebSocket server with noServer to avoid intercepting Vite's HMR
      const wss = new WebSocketServer({ noServer: true });
      (server.httpServer as Server).on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        if (req.url === "/__departments_ws") {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
          });
        }
        // Let Vite handle all other upgrade requests (HMR)
      });

      // Send snapshot on new connection
      wss.on("connection", (ws) => {
        ws.send(JSON.stringify(buildSnapshot(departmentsDir)));
      });

      // Ensure departments directory exists
      if (!fs.existsSync(departmentsDir)) {
        fs.mkdirSync(departmentsDir, { recursive: true });
      }

      // Watch state.json files using Vite's built-in chokidar watcher
      const stateGlob = path.join(departmentsDir, "*/state.json").replace(/\\/g, "/");
      server.watcher.add(stateGlob);

      // Debounce timers per department to avoid reading partial writes
      const changeTimers = new Map<string, ReturnType<typeof setTimeout>>();

      // Also watch for new department.yaml files
      const yamlGlob = path.join(departmentsDir, "*/department.yaml").replace(/\\/g, "/");
      server.watcher.add(yamlGlob);

      server.watcher.on("add", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const departmentName = extractDepartmentName(filePath, departmentsDir);
          if (!departmentName) return;
          clearTimeout(changeTimers.get(departmentName));
          changeTimers.set(departmentName, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: DepartmentState = JSON.parse(raw);
              broadcast(wss, { type: "DEPARTMENT_ACTIVE", department: departmentName, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("department.yaml")) {
          broadcast(wss, buildSnapshot(departmentsDir));
        }
      });

      server.watcher.on("change", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const departmentName = extractDepartmentName(filePath, departmentsDir);
          if (!departmentName) return;
          clearTimeout(changeTimers.get(departmentName));
          changeTimers.set(departmentName, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: DepartmentState = JSON.parse(raw);
              broadcast(wss, { type: "DEPARTMENT_UPDATE", department: departmentName, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("department.yaml")) {
          broadcast(wss, buildSnapshot(departmentsDir));
        }
      });

      server.watcher.on("unlink", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const departmentName = extractDepartmentName(filePath, departmentsDir);
          if (!departmentName) return;
          clearTimeout(changeTimers.get(departmentName));
          changeTimers.delete(departmentName);
          broadcast(wss, { type: "DEPARTMENT_INACTIVE", department: departmentName });
        } else if (filePath.endsWith("department.yaml")) {
          broadcast(wss, buildSnapshot(departmentsDir));
        }
      });
    },
  };
}

function extractDepartmentName(filePath: string, departmentsDir: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const normalizedBase = departmentsDir.replace(/\\/g, "/");
  const relative = normalized.replace(normalizedBase + "/", "");
  const parts = relative.split("/");
  return parts.length >= 2 ? parts[0] : null;
}
