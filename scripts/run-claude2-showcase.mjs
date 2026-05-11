#!/usr/bin/env node
// Optional live Claude2 showcase runner.
//
// This is intentionally outside `npm run verify`: it requires local Claude
// auth and model output is nondeterministic. Use it when you want to refresh
// the checked-in examples/claude2-showcase artifacts from real Claude runs.

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const SHOWCASE = join(ROOT, 'examples', 'claude2-showcase');
const TMP = join(ROOT, '.tmp', 'claude2-showcase-live');

const args = process.argv.slice(2);
const opts = {
  command: 'claude2',
  pluginDir: ROOT,
  budget: '3',
  caseName: null,
  updateFixtures: false,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--command') opts.command = args[++i];
  else if (arg === '--plugin-dir') opts.pluginDir = resolve(args[++i]);
  else if (arg === '--budget') opts.budget = args[++i];
  else if (arg === '--case') opts.caseName = args[++i];
  else if (arg === '--update-fixtures') opts.updateFixtures = true;
  else if (arg === '-h' || arg === '--help') {
    process.stdout.write(`Usage: node scripts/run-claude2-showcase.mjs [options]

Options:
  --case <name>          Run one case from examples/claude2-showcase
  --command <cmd>        Claude command to use (default: claude2)
  --plugin-dir <path>    Plugin directory to force-load (default: repo root)
  --budget <usd>         Max spend per case (default: 3)
  --update-fixtures      Copy generated outputs back into examples/claude2-showcase

Examples:
  npm run e2e:claude2 -- --case rich-positive-availability-unknown
  npm run e2e:claude2 -- --update-fixtures
`);
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

const cases = readdirSync(SHOWCASE, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !opts.caseName || name === opts.caseName)
  .sort();

if (opts.caseName && cases.length === 0) {
  throw new Error(`No showcase case named ${opts.caseName}`);
}

mkdirSync(TMP, { recursive: true });

for (const caseName of cases) {
  const caseDir = join(SHOWCASE, caseName);
  const promptPath = join(caseDir, 'prompt.txt');
  if (!existsSync(promptPath)) continue;

  const runDir = join(TMP, caseName);
  rmSync(runDir, { recursive: true, force: true });
  mkdirSync(runDir, { recursive: true });

  const prompt = readFileSync(promptPath, 'utf8');
  process.stdout.write(`Running ${caseName} with ${opts.command}\n`);
  const result = spawnSync(
    opts.command,
    [
      '--plugin-dir',
      opts.pluginDir,
      '--permission-mode',
      'bypassPermissions',
      '--no-session-persistence',
      '--max-budget-usd',
      opts.budget,
      '-p',
      prompt,
    ],
    {
      cwd: runDir,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    },
  );

  writeFileSync(join(runDir, 'claude2-output.txt'), result.stdout || '');
  if (result.stderr) writeFileSync(join(runDir, 'claude2-stderr.txt'), result.stderr);
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || '');
    throw new Error(`${caseName}: ${opts.command} exited ${result.status}`);
  }

  if (opts.updateFixtures) {
    copyFileSync(join(runDir, 'claude2-output.txt'), join(caseDir, 'claude2-output.txt'));
    for (const file of ['final_sequence.md', 'sequencer-output.json']) {
      const generated = join(runDir, file);
      if (existsSync(generated)) copyFileSync(generated, join(caseDir, file));
    }
  }
}

process.stdout.write(`Live Claude2 showcase runs written to ${TMP}\n`);
if (opts.updateFixtures) {
  process.stdout.write('Fixture files updated. Run npm run check:showcase next.\n');
}
