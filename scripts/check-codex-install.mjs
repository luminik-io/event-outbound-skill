#!/usr/bin/env node

import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const forwardTest = process.argv.includes('--forward-test');
const codex = process.env.CODEX_BIN || 'codex';
const temporaryRoot = mkdtempSync(join(tmpdir(), 'event-outbound-codex-'));
const codexHome = join(temporaryRoot, 'codex-home');
const marketplaceRoot = join(temporaryRoot, 'marketplace');
const pluginSource = join(marketplaceRoot, 'plugins', 'event-outbound');
const workspace = join(temporaryRoot, 'workspace');
const lastMessagePath = join(temporaryRoot, 'last-message.json');
const outputSchemaPath = join(temporaryRoot, 'forward-output-schema.json');

const run = (args, options = {}) => {
  const result = spawnSync(codex, args, {
    cwd: options.cwd || root,
    encoding: 'utf8',
    env: { ...process.env, CODEX_HOME: codexHome },
    input: options.input,
    timeout: options.timeout || 120_000,
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `codex ${args.join(' ')} failed (${result.status ?? 'spawn'}):\n` +
        `${result.stderr || result.error?.message || result.stdout}`,
    );
  }
  return result.stdout;
};

const findManifests = (directory, results = []) => {
  if (!existsSync(directory)) return results;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) findManifests(path, results);
    else if (entry.name === 'plugin.json' && dirname(path).endsWith(`${sep}.codex-plugin`)) {
      results.push(path);
    }
  }
  return results;
};

try {
  mkdirSync(codexHome, { recursive: true, mode: 0o700 });
  mkdirSync(pluginSource, { recursive: true });
  mkdirSync(join(marketplaceRoot, '.agents', 'plugins'), { recursive: true });
  mkdirSync(workspace, { recursive: true });

  for (const path of ['.claude-plugin', '.codex-plugin', 'skills', 'scripts', 'data']) {
    cpSync(join(root, path), join(pluginSource, path), { recursive: true });
  }
  for (const path of ['LICENSE', 'README.md', 'package.json']) {
    cpSync(join(root, path), join(pluginSource, path));
  }

  writeFileSync(
    join(marketplaceRoot, '.agents', 'plugins', 'marketplace.json'),
    `${JSON.stringify(
      {
        name: 'event-outbound-smoke',
        interface: { displayName: 'Event Outbound Smoke' },
        plugins: [
          {
            name: 'event-outbound',
            source: { source: 'local', path: './plugins/event-outbound' },
            policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
            category: 'Productivity',
          },
        ],
      },
      null,
      2,
    )}\n`,
    { mode: 0o600 },
  );

  run(['plugin', 'marketplace', 'add', marketplaceRoot, '--json']);
  run(['plugin', 'add', 'event-outbound@event-outbound-smoke', '--json']);
  const pluginList = run(['plugin', 'list', '--json']);
  if (!pluginList.includes('event-outbound') || !pluginList.includes('event-outbound-smoke')) {
    throw new Error('isolated Codex plugin list does not include event-outbound installation');
  }

  const installedManifest = findManifests(codexHome)
    .map((path) => ({ path, manifest: JSON.parse(readFileSync(path, 'utf8')) }))
    .find(
      ({ path, manifest }) =>
        manifest.name === 'event-outbound' && path.includes(`${sep}plugins${sep}cache${sep}`),
    );
  if (!installedManifest) {
    throw new Error('Codex did not create an installed event-outbound cache entry');
  }

  const installedRoot = resolve(dirname(installedManifest.path), '..');
  if (!installedRoot.startsWith(resolve(codexHome))) {
    throw new Error('installed plugin escaped the isolated CODEX_HOME');
  }
  const bridge = join(installedRoot, 'skills', 'event-outbound', 'scripts', 'run.mjs');
  if (!existsSync(bridge) || !statSync(bridge).isFile()) {
    throw new Error('installed skill bridge is missing from the Codex cache');
  }
  const bridgeResult = spawnSync(process.execPath, [bridge, 'validate-touch', '--help'], {
    cwd: workspace,
    encoding: 'utf8',
    timeout: 30_000,
  });
  if (bridgeResult.status !== 0 || !bridgeResult.stdout.includes('validate-touch.mjs')) {
    throw new Error(`installed skill bridge failed: ${bridgeResult.stderr}`);
  }

  if (forwardTest) {
    const authFile = process.env.CODEX_SMOKE_AUTH_FILE;
    if (!authFile || !existsSync(authFile)) {
      throw new Error('--forward-test requires CODEX_SMOKE_AUTH_FILE');
    }
    cpSync(authFile, join(codexHome, 'auth.json'));
    chmodSync(join(codexHome, 'auth.json'), 0o600);
    writeFileSync(
      outputSchemaPath,
      `${JSON.stringify({
        type: 'object',
        additionalProperties: false,
        required: ['skill_name', 'bridge_exit_code', 'drafted'],
        properties: {
          skill_name: { type: 'string', const: 'event-outbound' },
          bridge_exit_code: { type: 'integer', const: 0 },
          drafted: { type: 'boolean', const: false },
        },
      })}\n`,
      { mode: 0o600 },
    );
    const prompt =
      'Use $event-outbound. Resolve its installed absolute skill path and actually run the bundled validate-touch help command. Do not infer or fabricate the result. Return only the requested JSON with skill_name "event-outbound", bridge_exit_code 0, and drafted false. Do not browse, draft outreach, or write files.';
    const output = run(
      [
        '--ask-for-approval',
        'never',
        'exec',
        '--json',
        '--sandbox',
        'read-only',
        '--cd',
        workspace,
        '--skip-git-repo-check',
        '--ephemeral',
        '--ignore-user-config',
        '--output-schema',
        outputSchemaPath,
        '--output-last-message',
        lastMessagePath,
        prompt,
      ],
      { cwd: workspace, timeout: 180_000 },
    );
    const events = output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    const executedBridge = events.some(
      (event) =>
        event.type === 'item.completed' &&
        event.item?.type === 'command_execution' &&
        typeof event.item.command === 'string' &&
        event.item.command.includes('/skills/event-outbound/scripts/run.mjs') &&
        event.item.command.includes('validate-touch') &&
        event.item.command.includes('--help') &&
        event.item.exit_code === 0,
    );
    if (!executedBridge) {
      throw new Error('fresh Codex task did not execute the installed validator bridge');
    }
    const lastMessage = JSON.parse(readFileSync(lastMessagePath, 'utf8'));
    if (
      lastMessage.skill_name !== 'event-outbound' ||
      lastMessage.bridge_exit_code !== 0 ||
      lastMessage.drafted !== false
    ) {
      throw new Error('fresh Codex task did not return the expected structured result');
    }
  }

  process.stdout.write(
    `Isolated Codex marketplace install and cache-load checks passed${
      forwardTest ? ' with a fresh-task forward test' : ''
    }\n`,
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
