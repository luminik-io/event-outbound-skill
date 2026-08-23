#!/usr/bin/env node

import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const read = (path) => readFileSync(join(root, path), 'utf8');
const readJson = (path) => JSON.parse(read(path));
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const claudeManifest = readJson('.claude-plugin/plugin.json');
const codexManifest = readJson('.codex-plugin/plugin.json');
const pkg = readJson('package.json');
const skill = read('skills/event-outbound/SKILL.md');
const openaiYaml = read('skills/event-outbound/agents/openai.yaml');

expect(claudeManifest.name === 'event-outbound', 'Claude plugin name must be event-outbound');
expect(codexManifest.name === claudeManifest.name, 'Claude and Codex plugin names must match');
expect(codexManifest.skills === './skills/', 'Codex manifest must discover ./skills/');
expect(pkg.files.includes('.codex-plugin/'), 'npm package must include the Codex manifest');
expect(
  claudeManifest.version === codexManifest.version && codexManifest.version === pkg.version,
  'Claude, Codex, and npm versions must match',
);
expect(
  openaiYaml.includes('default_prompt:') && openaiYaml.includes('$event-outbound'),
  'agents/openai.yaml default_prompt must mention $event-outbound',
);

const frontmatter = /^---\n([\s\S]*?)\n---/.exec(skill)?.[1] ?? '';
const frontmatterKeys = [...frontmatter.matchAll(/^([a-z][a-z0-9-]*):/gm)].map((match) => match[1]);
expect(
  JSON.stringify(frontmatterKeys) === JSON.stringify(['name', 'description']),
  'SKILL.md frontmatter must contain only name and description',
);
expect(
  !skill.includes('node "${CLAUDE_PLUGIN_ROOT}/scripts/'),
  'SKILL.md must use the client-neutral validator bridge',
);

const installRoot = mkdtempSync(join(tmpdir(), 'event-outbound-install-'));
try {
  for (const path of ['.claude-plugin', '.codex-plugin', 'skills', 'scripts', 'data']) {
    cpSync(join(root, path), join(installRoot, path), { recursive: true });
  }

  const installedClaude = JSON.parse(
    readFileSync(join(installRoot, '.claude-plugin', 'plugin.json'), 'utf8'),
  );
  const installedCodex = JSON.parse(
    readFileSync(join(installRoot, '.codex-plugin', 'plugin.json'), 'utf8'),
  );
  expect(installedClaude.name === installedCodex.name, 'Relocated client manifests must agree');

  const bridge = join(installRoot, 'skills', 'event-outbound', 'scripts', 'run.mjs');
  for (const [command, args] of [
    ['validate-touch', ['--help']],
    ['validate-sequence', ['--help']],
    ['validate-artifact', ['--help']],
  ]) {
    const result = spawnSync(process.execPath, [bridge, command, ...args], {
      cwd: tmpdir(),
      encoding: 'utf8',
    });
    expect(
      result.status === 0,
      `${command} bridge must run from a relocated install: ${result.stderr.trim()}`,
    );
  }

  const timeline = spawnSync(process.execPath, [bridge, 'plan-timeline'], {
    cwd: tmpdir(),
    input: JSON.stringify({
      leadTimeWeeks: 2,
      channels: ['email'],
      touchCount: 3,
      minGapDays: 4,
      today: '2026-09-01',
      eventStartDate: '2026-09-15',
    }),
    encoding: 'utf8',
  });
  expect(timeline.status === 0, `timeline bridge must run: ${timeline.stderr.trim()}`);
  if (timeline.status === 0) {
    const payload = JSON.parse(timeline.stdout);
    expect(payload.isValid === true, 'timeline bridge must return a valid plan');
    expect(payload.timeline?.length === 3, 'timeline bridge must preserve requested touch count');
  }
} finally {
  rmSync(installRoot, { recursive: true, force: true });
}

if (failures.length > 0) {
  process.stderr.write(
    `Cross-client packaging checks failed:\n${failures.map((f) => `- ${f}`).join('\n')}\n`,
  );
  process.exit(1);
}

process.stdout.write('Cross-client packaging checks passed for Claude and Codex/ChatGPT\n');
