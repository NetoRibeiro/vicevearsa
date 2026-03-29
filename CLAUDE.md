# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**ViceVearsa** is a multi-agent orchestration framework that lets users design AI departments — teams of specialized agents that work together to complete complex tasks. It is distributed as an npm package and operated through IDE slash commands.

## Quick Start for Users

Type `/vicevearsa` to open the main menu, or use any of these commands:
- `/vicevearsa create` — Create a new department
- `/vicevearsa run <name>` — Run a department
- `/vicevearsa help` — See all commands

## Development Commands

```bash
npm install                              # Install dependencies
npm test                                 # Run all tests (node --test tests/*.test.js)
npm run lint                             # ESLint on src/ bin/ tests/
node --test tests/agents.test.js         # Run a single test file
node --test tests/*skills* --grep "pat"  # Run tests matching a pattern
npm run version                          # Sync version into templates/_vicevearsa/.vicevearsa-version
```

### Dashboard (separate app in `dashboard/`)

```bash
cd dashboard
npm install          # First time only
npm run dev          # Vite dev server (default port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```

## Architecture

### Two Codebases

| Area | Path | Runtime | Purpose |
|------|------|---------|---------|
| **Core framework** | `src/`, `bin/` | Node.js (ESM) | CLI, agent management, skills, bundling |
| **Dashboard** | `dashboard/` | React 19 + Vite 6 + Pixi.js 8 + Zustand 5 (TypeScript) | Real-time agent visualization and approval UI |

These are independent — the core framework has no dependency on the dashboard. They communicate through the filesystem (`departments/*/state.json`) and WebSocket messages.

### Core Framework Modules

- **`bin/vicevearsa.js`** — CLI entry point; routes commands to modules
- **`src/init.js`** — Copies `templates/` into user projects
- **`src/agents.js`** — Agent registry, loading, composition
- **`src/prompt.js`** — Prompt building and template formatting
- **`src/skills.js` / `src/skills-cli.js`** — Skill install, remove, update
- **`src/agents-cli.js`** — Agent CLI subcommands
- **`src/runs.js`** — Execution history tracking
- **`src/bundle.js` / `src/bundle-detector.js`** — Bundle departments for sharing; detect bundled vs project mode
- **`src/export.js`** — CLI wrapper for bundling
- **`src/update.js`** — Framework self-update
- **`src/logger.js`** — CLI output formatting
- **`src/i18n.js`** / **`src/locales/`** — Internationalization and translation files

### Dashboard Architecture

The dashboard is a Pixi.js pixel-art virtual office rendered in a React app. Uses `@/*` path alias for imports (mapped to `./src/*` in tsconfig and vite config).

**Data flow:** Filesystem → Vite plugin → WebSocket → Zustand store → React/Pixi rendering

Key files:
- **`dashboard/src/plugin/departmentWatcher.ts`** — Vite plugin that watches `departments/` with chokidar, serves WebSocket on `/__departments_ws`, and provides HTTP fallback at `/api/snapshot`
- **`dashboard/src/hooks/useDepartmentSocket.ts`** — Client-side WebSocket with auto-reconnect (exponential backoff 1s→30s) and HTTP polling fallback after 3 failures
- **`dashboard/src/store/useDepartmentStore.ts`** — Zustand store holding `departments`, `activeStates`, `selectedDepartment`
- **`dashboard/src/office/OfficeScene.tsx`** — Pixi.js canvas rendering all agent desks
- **`dashboard/src/office/AgentDesk.tsx`** — Individual agent desk with status animations and approval flash effects
- **`dashboard/src/components/ApprovalMemo.tsx`** — Approval popup (approve/revise with instructions)
- **`dashboard/src/types/state.ts`** — All TypeScript interfaces for state, agents, approvals, and WebSocket messages

### WebSocket Protocol

Messages backend → dashboard: `SNAPSHOT`, `DEPARTMENT_UPDATE`, `DEPARTMENT_INACTIVE`, `APPROVAL_REQUEST`, `APPROVAL_RESPONSE_ACK`

Messages dashboard → backend: `APPROVAL_RESPONSE` (action: `"approve"` | `"revise"`, optional `instruction`)

### Department Watcher Plugin Details

- Uses `noServer: true` on WebSocketServer to avoid conflicting with Vite's HMR WebSocket
- `resolveDepartmentsDir()` checks both `../departments` (run from `dashboard/`) and `./departments` (run from root)
- chokidar config: `awaitWriteFinish` with 300ms stability threshold, `depth: 2`, ignores dotfiles/node_modules/output
- `state.json` changes → broadcasts `DEPARTMENT_UPDATE`; `department.yaml` changes → rebuilds and broadcasts full `SNAPSHOT`

## User-Facing Directory Structure

When initialized in a project via `npx vicevearsa init`:

```
_vicevearsa/                  Core files (do not edit manually)
  _memory/company.md          Company context loaded for every run
  _browser_profile/           Persistent Playwright sessions (gitignored)
  .vicevearsa-version         Installed framework version
skills/                       Installed skills
departments/
  {name}/
    department.yaml           Department metadata
    state.json                Live execution state (read by dashboard)
    agents/                   Agent definition files (.agent.md)
    pipeline/
      pipeline.yaml           Step sequence
      steps/                  Individual step files (.md with frontmatter)
    _investigations/          Auguste-Dupin content investigations
    _memory/                  Department-specific memory
    input/                    Input files for pipeline
    output/                   Generated content
```

## Department YAML Format

Root-level keys (NOT nested under a `department:` key):

```yaml
code: content-review
name: Content Review Studio
description: Review and approve content with dashboard feedback
icon: 👁️
company: ../_vicevearsa/_memory/company.md

agents:
  - researcher: ./agents/researcher.agent.md
  - writer: ./agents/writer.agent.md

skills:
  - web_search
```

**Critical:** The `agents` array contains objects `[{agentName: path}, ...]`, not strings. The dashboard plugin extracts agent IDs via `Object.keys()` on each entry. Some departments use expanded format: `[{id, name, icon, custom, execution, skills}, ...]`.

## Pipeline Step Format

Step files in `pipeline/steps/` use YAML frontmatter:

```yaml
---
step_id: research
agent: researcher
execution: subagent          # or "inline"
model_tier: powerful
approval_needed: true
approval_question: Are the research findings comprehensive?
inputFile: departments/content-review/input/topic.md
outputFile: departments/content-review/output/research.md
---
```

Steps with `type: checkpoint` are manual user-approval gates. Steps with `approval_needed: true` trigger the dashboard's approval popup.

## Execution Flow

1. `/vicevearsa` skill is the entry point for all interactions
2. **Architect** agent designs departments from user descriptions
3. **Auguste-Dupin** investigator can analyze reference profiles (Instagram, YouTube, Twitter/X, LinkedIn)
4. **Pipeline Runner** executes departments, writing `state.json` as it progresses
5. Agents communicate via persona switching (inline) or subagents (background)
6. Checkpoints pause for user input/approval — via IDE console or dashboard popup

## npm Package Distribution

- Package name: `vicevearsa` (published to npm)
- Bin entry: `bin/vicevearsa.js` → `vicevearsa` command
- Published files: `bin/`, `src/`, `skills/`, `templates/`
- `templates/` contents are copied into user projects during `init`
- `templates/ide-templates/` contains IDE-specific command templates for 6 supported IDEs (claude-code, cursor, codex, opencode, antigravity, vscode-copilot)
- System agents (architect, runner, skills engine) live in `templates/_vicevearsa/core/`, not a top-level `agents/` directory
- Version script syncs `package.json` version → `templates/_vicevearsa/.vicevearsa-version`

## Testing

Node's built-in test runner. Test files mirror source modules:

`agents.test.js`, `skills.test.js`, `init.test.js`, `update.test.js`, `runs.test.js`, `bundle.test.js`, `bundle-detector.test.js`, `logger.test.js`, `i18n.test.js`

Dashboard has a separate manual testing guide: `dashboard/APPROVAL_TESTING.md`

## Rules for Developers

- Changes to `src/` or `bin/` must pass `npm test` and `npm run lint`
- All new features need corresponding tests in `tests/`
- Template updates in `templates/` should be tested by running `npx vicevearsa init` in a temp directory
- Use `npm run version` when updating the package version
- The dashboard is TypeScript; the core framework is plain ESM JavaScript
- ESLint uses v10 flat config (`eslint.config.js`, not `.eslintrc`), targeting ES2024+

## Browser Sessions

ViceVearsa uses a persistent Playwright browser profile for social media access.
- Sessions stored in `_vicevearsa/_browser_profile/` (gitignored)
- First platform access requires manual login; subsequent runs reuse the session
- **Important:** The native Claude Code Playwright plugin must be disabled. ViceVearsa uses its own `@playwright/mcp` server configured in `.mcp.json`, which points to `_vicevearsa/config/playwright.config.json`.
