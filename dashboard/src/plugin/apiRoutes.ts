import type { IncomingMessage, ServerResponse } from "node:http";
import fsp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export interface RouteContext {
  departmentsDir: string;
  viceversaDir: string;
}

type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RouteContext,
  params: Record<string, string>
) => Promise<void>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

const routes: Route[] = [];

function route(method: string, urlPath: string, handler: Handler) {
  const paramNames: string[] = [];
  const pattern = new RegExp(
    "^" +
      urlPath.replace(/:(\w+)/g, (_match, name) => {
        paramNames.push(name);
        return "([^/]+)";
      }) +
      "$"
  );
  routes.push({ method, pattern, paramNames, handler });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// ── GET /api/onboarding ───────────────────────────────────────────────
route("GET", "/api/onboarding", async (_req, res, ctx) => {
  const companyPath = path.join(ctx.viceversaDir, "_memory", "company.md");
  let complete = false;
  try {
    const content = await fsp.readFile(companyPath, "utf-8");
    complete = content.trim().length > 100;
  } catch {
    // File doesn't exist = not complete
  }

  const prefsPath = path.join(ctx.viceversaDir, "_memory", "preferences.md");
  let userName = "";
  let language = "English";
  try {
    const prefs = await fsp.readFile(prefsPath, "utf-8");
    const nameMatch = prefs.match(/\*\*User Name:\*\*\s*(.+)/);
    if (nameMatch) userName = nameMatch[1].trim();
    const langMatch = prefs.match(/\*\*Output Language:\*\*\s*(.+)/);
    if (langMatch) language = langMatch[1].trim();
  } catch {
    // No prefs file
  }

  json(res, 200, { complete, userName, language });
});

// ── POST /api/onboarding ──────────────────────────────────────────────
route("POST", "/api/onboarding", async (req, res, ctx) => {
  const body = JSON.parse(await readBody(req));
  const { userName, companyName, companyUrl, companyDescription } = body;

  // Write company.md
  const companyContent = `# ${companyName || "My Company"}

**Website:** ${companyUrl || "N/A"}

## About
${companyDescription || ""}
`;
  const companyPath = path.join(ctx.viceversaDir, "_memory", "company.md");
  await fsp.mkdir(path.dirname(companyPath), { recursive: true });
  await fsp.writeFile(companyPath, companyContent, "utf-8");

  // Update preferences with user name
  const prefsPath = path.join(ctx.viceversaDir, "_memory", "preferences.md");
  try {
    let prefs = await fsp.readFile(prefsPath, "utf-8");
    prefs = prefs.replace(
      /\*\*User Name:\*\*\s*.*/,
      `**User Name:** ${userName}`
    );
    await fsp.writeFile(prefsPath, prefs, "utf-8");
  } catch {
    await fsp.writeFile(
      prefsPath,
      `# ViceVearsa Preferences\n\n- **User Name:** ${userName}\n- **Output Language:** English\n`,
      "utf-8"
    );
  }

  json(res, 200, { success: true });
});

// ── GET /api/departments ──────────────────────────────────────────────
route("GET", "/api/departments", async (_req, res, ctx) => {
  const departments: Array<{
    code: string;
    name: string;
    description: string;
    icon: string;
    agents: string[];
  }> = [];

  let entries;
  try {
    entries = await fsp.readdir(ctx.departmentsDir, { withFileTypes: true });
  } catch {
    json(res, 200, { departments: [] });
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(ctx.departmentsDir, entry.name, "department.yaml");
    try {
      const raw = await fsp.readFile(yamlPath, "utf-8");
      const parsed = parseYaml(raw);
      let agents: string[] = [];
      if (Array.isArray(parsed.agents)) {
        agents = parsed.agents.flatMap((a: unknown) => {
          if (typeof a === "string") return [a];
          if (a && typeof a === "object") return Object.keys(a as Record<string, unknown>);
          return [];
        });
      }
      departments.push({
        code: parsed.code || entry.name,
        name: parsed.name || entry.name,
        description: parsed.description || "",
        icon: parsed.icon || "\u{1F4CB}",
        agents,
      });
    } catch {
      departments.push({
        code: entry.name,
        name: entry.name,
        description: "",
        icon: "\u{1F4CB}",
        agents: [],
      });
    }
  }

  json(res, 200, { departments });
});

// ── DELETE /api/departments/:id ───────────────────────────────────────
route("DELETE", "/api/departments/:id", async (_req, res, ctx, params) => {
  const deptDir = path.join(ctx.departmentsDir, params.id);
  try {
    await fsp.rm(deptDir, { recursive: true, force: true });
    json(res, 200, { success: true });
  } catch (err) {
    json(res, 500, { error: (err as Error).message });
  }
});

// ── PUT /api/departments/:id ──────────────────────────────────────────
route("PUT", "/api/departments/:id", async (req, res, ctx, params) => {
  const body = JSON.parse(await readBody(req));
  const yamlPath = path.join(ctx.departmentsDir, params.id, "department.yaml");

  try {
    const raw = await fsp.readFile(yamlPath, "utf-8");
    const parsed = parseYaml(raw);

    if (body.name !== undefined) parsed.name = body.name;
    if (body.description !== undefined) parsed.description = body.description;
    if (body.icon !== undefined) parsed.icon = body.icon;

    await fsp.writeFile(yamlPath, stringifyYaml(parsed), "utf-8");
    json(res, 200, { success: true });
  } catch (err) {
    json(res, 500, { error: (err as Error).message });
  }
});

// ── GET /api/departments/:id/history ──────────────────────────────────
route("GET", "/api/departments/:id/history", async (_req, res, ctx, params) => {
  const historyPath = path.join(ctx.departmentsDir, params.id, "approval-history.json");
  try {
    const raw = await fsp.readFile(historyPath, "utf-8");
    json(res, 200, { history: JSON.parse(raw) });
  } catch {
    json(res, 200, { history: [] });
  }
});

// ── POST /api/bundles/import ──────────────────────────────────────────
route("POST", "/api/bundles/import", async (req, res, ctx) => {
  const body = JSON.parse(await readBody(req));
  const bundlePath = body.path;

  if (!bundlePath || !fs.existsSync(bundlePath)) {
    json(res, 400, { error: "Bundle path not found" });
    return;
  }

  try {
    const bundleName = path.basename(bundlePath);
    const destDir = path.join(ctx.departmentsDir, bundleName);
    await fsp.cp(bundlePath, destDir, { recursive: true });
    json(res, 200, { success: true, department: bundleName });
  } catch (err) {
    json(res, 500, { error: (err as Error).message });
  }
});

// ── Router middleware ─────────────────────────────────────────────────
export function createApiMiddleware(ctx: RouteContext) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) => {
    if (!req.url?.startsWith("/api/") || req.url === "/api/snapshot") {
      return next();
    }

    const method = req.method?.toUpperCase() || "GET";

    for (const r of routes) {
      if (r.method !== method) continue;
      const match = r.pattern.exec(req.url);
      if (!match) continue;

      const params: Record<string, string> = {};
      r.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });

      try {
        await r.handler(req, res, ctx, params);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  };
}
