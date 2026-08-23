#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMANDS = new Map([
  ['plan-timeline', 'plan-timeline.mjs'],
  ['validate-touch', 'validate-touch.mjs'],
  ['validate-sequence', 'validate-sequence.mjs'],
  ['validate-artifact', 'validate-artifact.mjs'],
]);

const [, , command, ...args] = process.argv;
if (!COMMANDS.has(command)) {
  process.stderr.write(`Usage: run.mjs <${[...COMMANDS.keys()].join('|')}> [arguments...]\n`);
  process.exit(2);
}

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pluginRoot = resolve(skillRoot, '..', '..');
const target = resolve(pluginRoot, 'scripts', COMMANDS.get(command));

if (!existsSync(target)) {
  process.stderr.write(
    `event-outbound: canonical validator is missing from the installed plugin: ${target}\n` +
      'Install the complete event-outbound plugin instead of copying only SKILL.md.\n',
  );
  process.exit(2);
}

const result = spawnSync(process.execPath, [target, ...args], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
});

if (result.error) {
  process.stderr.write(`event-outbound: failed to start ${command}: ${result.error.message}\n`);
  process.exit(1);
}

process.exit(result.status ?? 1);
