# vicevearsa

Design AI agents that stay in sync — right inside your IDE. lucide:code-2

ViceVersa is a refined multi-agent orchestration framework. Describe your mission; ViceVersa aligns a team of specialized agents to master your workflow instantly.

## What is a Department?

A Department is a collective of specialized AI agents built to solve a single mission.
- **Specialized Roles**: Every agent owns a specific task in the chain. ph:briefcase-bold
- **Automated Pipeline**: Work flows through a structured sequence. ph:flow-arrow-bold
- **Human Oversight**: The process pauses only for your final decision or checkpoint.

Example:

- **Researcher** gathers information and industry trends
- **Strategist** generates ideas and defines the approach
- **Writer** produces the final content
- **Reviewer** ensures quality before delivery

## Installation

**Prerequisite:** Node.js 20+

```bash
npx vicevearsa init
```

To update an existing installation:

```bash
npx vicevearsa update
```

## Supported IDEs

| IDE | Status |
|-----|--------|
| Antigravity | Available |
| Claude Code | Available |
| Codex (OpenAI) | Available |
| Open Code | Available |
| Cursor | Available |
| VS Code + Copilot | Available |

## Dashboard & Approval Workflow

The Dashboard is a real-time virtual office where you watch agents work and approve/revise their outputs.

### Starting the Dashboard

From your project root:

```bash
cd dashboard
npm run dev
```

The dev server will start on `http://localhost:5173` (or next available port).

### Dashboard Features

- **Real-time Agent Status**: See which agent is active, idle, or waiting for approval
- **Approval Requests**: When an agent needs your approval, an interactive memo popup appears
- **Approve or Revise**: Click "✓ Approve" to continue, or "→ Revise" with instructions
- **Visual Feedback**: Blue monitor = active agent, gray = idle, gold = waiting for approval

### Approval Workflow Example

When a `content-review` department runs:

1. **Researcher agent** gathers information and needs approval
   - Click the researcher's desk (gold status dot)
   - Review the memo popup with research findings
   - Approve or request revisions

2. **Writer agent** creates content based on research
   - Approve writing style and structure
   - Or revise with specific feedback

3. **Review checkpoint** shows final content
   - Approve for publishing
   - Or request another round of revisions

### Dashboard Troubleshooting

If agents aren't showing or approvals aren't appearing:

1. **Check the browser console** (F12 → Console)
   - Should NOT see "WebSocket is closed" errors
   - Should see clean connection

2. **Verify the departments directory exists**
   - `departments/` folder at project root
   - Each department has `department.yaml` with agent definitions

3. **Confirm the dashboard is running**
   ```bash
   cd dashboard && npm run dev
   ```
   - Should log: `[department-watcher] departments dir: ...`

## Architecture Overview

ViceVearsa consists of:

- **Core Framework** (`src/`) — Agent orchestration, pipeline execution, approval handling
- **CLI** (`bin/vicevearsa.js`) — Command-line interface
- **Dashboard** (`dashboard/`) — Real-time visual interface for monitoring and approvals
- **Templates** (`templates/`) — Boilerplate for new projects
- **Agents** (`agents/`) — Pre-built agent definitions

For developers working on the framework, see [CLAUDE.md](./CLAUDE.md) for detailed architecture and testing guidelines.

## Creating your Department

Describe what you need:

```
/vicevearsa create "A department that writes LinkedIn posts about AI trends"
```

The **Architect** asks a few questions, designs the department, and sets everything up automatically. You approve the design before any execution begins.

## Running a Department

```
/vicevearsa run <department-name>
```

The department runs automatically, pausing only at checkpoints where your decision is needed.

## Examples

```
/vicevearsa create "Department that generates Instagram carousels from trending news, creates the images, and publishes automatically"
/vicevearsa create "Department that produces all infoproduct launch materials: sales pages, WhatsApp messages, emails, and CPL scripts"
/vicevearsa create "Department that writes complete tutorials with screenshots for employee training"
/vicevearsa create "Department that takes YouTube videos and automatically generates viral clips"
```

## Commands

| Command | What it does |
|---------|-------------|
| `/vicevearsa` | Open the main menu |
| `/vicevearsa help` | Show all commands |
| `/vicevearsa create` | Create a new department |
| `/vicevearsa run <name>` | Run a department |
| `/vicevearsa list` | See all your departments |
| `/vicevearsa edit <name>` | Modify a department |
| `/vicevearsa skills` | Browse installed skills |
| `/vicevearsa install <name>` | Install a skill from catalog |
| `/vicevearsa uninstall <name>` | Remove an installed skill |

## Recent Fixes

### Dashboard Agent Display (v0.x.x)

**Issue**: Agents defined in `department.yaml` weren't showing in the Dashboard virtual office.

**Cause**: YAML parsing bug in the department watcher plugin — it was looking for agents in the wrong location.

**Fix**: Updated the plugin to correctly parse department metadata and extract agent names from both object and string formats.

**How to verify**:
- Start the dashboard: `cd dashboard && npm run dev`
- Visit `http://localhost:PORT/api/snapshot` in your browser
- You should see all agents listed with their names

## License

MIT — use it however you want.
