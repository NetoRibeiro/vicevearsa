#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/init.js';
import { update } from '../src/update.js';
import { skillsCli } from '../src/skills-cli.js';
import { agentsCli } from '../src/agents-cli.js';
import { listRuns, printRuns } from '../src/runs.js';
import { exportDepartment } from '../src/export.js';

const { positionals } = parseArgs({
  allowPositionals: true,
  strict: false,
});

const command = positionals[0];

if (command === 'init') {
  await init(process.cwd());
} else if (command === 'install') {
  // npx vicevearsa install <name>
  const result = await skillsCli('install', positionals.slice(1), process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'uninstall') {
  // npx vicevearsa uninstall <name>
  const result = await skillsCli('remove', positionals.slice(1), process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'update') {
  const target = positionals[1];
  if (target) {
    // npx vicevearsa update <name> → update specific skill
    const result = await skillsCli('update-one', [target], process.cwd());
    if (!result.success) process.exitCode = 1;
  } else {
    // npx vicevearsa update → update core
    const result = await update(process.cwd());
    if (!result.success) process.exitCode = 1;
  }
} else if (command === 'skills') {
  // Backward compat: npx vicevearsa skills list|install|remove|update
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await skillsCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'agents') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await agentsCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'runs') {
  const departmentName = positionals[1] || null;
  const runs = await listRuns(departmentName, process.cwd());
  printRuns(runs);
} else if (command === 'bundle' || command === 'export') {
  // npx vicevearsa bundle <department> [--output <path>] [--zip]
  const args = positionals.slice(1);
  const result = await exportDepartment(args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else {
  console.log(`
  vicevearsa — Multi-agent orchestration for Claude Code

  Usage:
    npx vicevearsa init                    Initialize ViceVearsa
    npx vicevearsa update                  Update ViceVearsa core
    npx vicevearsa install <name>          Install a skill
    npx vicevearsa uninstall <name>        Remove a skill
    npx vicevearsa update <name>           Update a specific skill
    npx vicevearsa skills                  List installed skills
    npx vicevearsa agents                  List installed agents
    npx vicevearsa agents install <name>   Install a predefined agent
    npx vicevearsa agents remove <name>    Remove an agent
    npx vicevearsa agents update           Update all agents
<<<<<<< HEAD
    npx vicevearsa runs [department-name]  View execution history
    npx vicevearsa bundle <department>     Bundle department for sharing
    npx vicevearsa export <department>     Export department (alias for bundle)
=======
    npx vicevearsa runs [department-name]     View execution history
>>>>>>> 45965c418044b57e3da07b9e8aced5e00b94ae50

  Learn more: https://github.com/netoribeiro/vicevearsa
  `);
  if (command) process.exitCode = 1;
}
