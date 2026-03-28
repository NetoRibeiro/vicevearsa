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

## Virtual Office

The Virtual Office is a 2D visual interface that shows your agents working in real time.

**Step 1 — Generate the dashboard** (in your IDE):

```
/vicevearsa dashboard
```

**Step 2 — Serve it locally** (in terminal):

```bash
npx serve departments/<department-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.

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

## License

MIT — use it however you want.
