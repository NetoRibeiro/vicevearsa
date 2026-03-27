# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# ViceVearsa — Project Instructions

**ViceVearsa** is a multi-agent orchestration framework that lets users design AI departments—teams of specialized agents that work together to complete complex tasks.

## Quick Start for Users

Type `/vicevearsa` to open the main menu, or use any of these commands:
- `/vicevearsa create` — Create a new departmen
- `/vicevearsa run <name>` — Run a departmen
- `/vicevearsa help` — See all commands

## Development Setup

This project is a published npm package. To work on the framework:

```bash
npm install           # Install dependencies
npm test              # Run all tests
npm run lint          # Check code quality
```

### Running Individual Tests

```bash
node --test tests/agents.test.js      # Test agent system
node --test tests/skills.test.js      # Test skill management
node --test tests/init.test.js        # Test initialization
node --test tests/update.test.js      # Test update mechanism
```

### Testing with Pattern Matching

```bash
node --test tests/*.test.js            # Run all tests
node --test tests/*skills* --grep "pattern"  # Run tests matching a pattern
```

## Architecture Overview

### Core Module Structure

The ViceVearsa framework is organized into these key modules:

- **`src/init.js`** — Initializes a new ViceVearsa installation in a directory; creates template structure
- **`src/agents.js`** — Manages agent definitions and agent registry; handles agent loading and composition
- **`src/prompt.js`** — Builds and formats prompts for agents; manages prompt templates
- **`src/skills.js`** — Manages skill installation, removal, and updates
- **`src/skills-cli.js`** — CLI interface for skill management (`install`, `remove`, `update`)
- **`src/agents-cli.js`** — CLI interface for agent management
- **`src/runs.js`** — Tracks execution history and departmen runs
- **`src/update.js`** — Updates the ViceVearsa core framework
- **`src/logger.js`** — Logging utilities for CLI output
- **`src/i18n.js`** — Internationalization support

### Entry Point

- **`bin/vicevearsa.js`** — CLI entry point; routes commands to appropriate modules

### Directory Structure (User-Facing)

When initialized in a project:

- `_vicevearsa/` — ViceVearsa core files (do not modify manually)
- `_vicevearsa/_memory/` — Persistent memory (company context, preferences)
- `skills/` — Installed skills (integrations, scripts, prompts)
- `departmens/` — User-created departmens
- `departmens/{name}/_investigations/` — Auguste-Dupin content investigations (profile analyses)
- `departmens/{name}/output/` — Generated content and files
- `_vicevearsa/_browser_profile/` — Persistent browser sessions (login cookies, localStorage)

### Templates (Distribution)

- **`templates/`** — Template files distributed with the npm package; initialized into user projects via `src/init.js`
- **`templates/_vicevearsa/`** — Core template structure
- **`agents/`** — Predefined agents available for installation

## How It Works (User Perspective)

1. The `/vicevearsa` skill is the entry point for all interactions
2. The **Architect** agent creates and modifies departmens
3. During departmen creation, the **Auguste-Dupin** investigator can analyze reference profiles (Instagram, YouTube, Twitter/X, LinkedIn) to extract real content patterns
4. The **Pipeline Runner** executes departmens automatically
5. Agents communicate via persona switching (inline) or subagents (background)
6. Checkpoints pause execution for user input/approval

## Framework Distribution & Packaging

ViceVearsa is distributed as an npm package (published to npm registry).

- **Package name:** `vicevearsa`
- **Bin entry:** `bin/vicevearsa.js` is registered as the `vicevearsa` command in `package.json`
- **Files included:** `bin/`, `src/`, `agents/`, `skills/`, `templates/` (see `files` field in package.json)
- **Distributed files:** The contents of `templates/` are copied into user projects during initialization
- **Version tracking:** `templates/_vicevearsa/.vicevearsa-version` stores the installed version; updated via `npm run version` script

When users run `npx vicevearsa init`, the `templates/` directory structure is copied into their project with `_vicevearsa/` and initial directories set up.

## Testing Approach

The project uses Node's built-in test runner (`node --test`). Tests are organized by module:

- **agents.test.js** — Agent loading, registry, and composition
- **skills.test.js** — Skill install/remove/update operations
- **init.test.js** — Initialization process
- **update.test.js** — Update mechanism and version management
- **runs.test.js** — Execution history tracking
- **logger.test.js** — Log output formatting
- **i18n.test.js** — Internationalization

When adding features, add corresponding tests in the `tests/` directory. All tests must pass before merging.

## Rules for Users

- Always use `/vicevearsa` commands to interact with the system
- Do not manually edit files in `_vicevearsa/core/` unless you know what you're doing
- Departmen YAML files can be edited manually if needed, but prefer using `/vicevearsa edit`
- Company context in `_vicevearsa/_memory/company.md` is loaded for every departmen run

## Rules for Developers

- Changes to `src/` or `bin/` must pass `npm test` and `npm run lint`
- When modifying CLI behavior, update corresponding test files
- Template updates in `templates/` should be tested by running `npx vicevearsa init` in a test directory
- All new features should include tests—don't add untested code
- Use the version script (`npm run version`) when updating the package version

## Browser Sessions

ViceVearsa uses a persistent Playwright browser profile to keep you logged into social media platforms.
- Sessions are stored in `_vicevearsa/_browser_profile/` (gitignored, private to you)
- First time accessing a platform, you'll log in manually once
- Subsequent runs will reuse your saved session
- **Important:** The native Claude Code Playwright plugin must be disabled. ViceVearsa uses its own `@playwright/mcp` server configured in `.mcp.json`.
