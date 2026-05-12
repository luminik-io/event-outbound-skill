#!/usr/bin/env node
// Optional live Claude full-sequence runner.
//
// This is outside normal CI because it needs local Claude auth and model output
// changes run to run. It verifies the installed skill can produce a complete
// final_sequence.md plus sequencer-output.json, then runs validate-artifact.mjs.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const DEFAULT_CASES = join(ROOT, 'scripts', 'claude-full-sequence-cases.json');
const DEFAULT_OUTPUT = join(ROOT, '.tmp', 'claude-full-sequence-live');

const BAD_PHRASE_ECHOES = [
  'open to a look',
  'worth pressure-testing before',
  'useful for amsterdam prep',
  'compare notes',
  'comparing notes',
  'separate thread',
  'earlier note',
  'previous note',
  'following up on my',
  'this is usually the week',
  'new rails get attention',
  'ready to send',
  'cleared for deployment',
  'approved for outreach',
];

const args = process.argv.slice(2);
const opts = {
  command: 'claude',
  pluginDir: ROOT,
  casesPath: DEFAULT_CASES,
  outputDir: DEFAULT_OUTPUT,
  caseId: null,
  maxCases: null,
  budget: '5',
  model: 'sonnet',
  timeoutMs: 480_000,
  selfTest: false,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--command') opts.command = args[++i];
  else if (arg === '--plugin-dir') opts.pluginDir = resolve(args[++i]);
  else if (arg === '--cases') opts.casesPath = resolve(args[++i]);
  else if (arg === '--output-dir') opts.outputDir = resolve(args[++i]);
  else if (arg === '--case') opts.caseId = args[++i];
  else if (arg === '--max-cases') opts.maxCases = Number(args[++i]);
  else if (arg === '--budget') opts.budget = args[++i];
  else if (arg === '--model') opts.model = args[++i];
  else if (arg === '--timeout-ms') opts.timeoutMs = Number(args[++i]);
  else if (arg === '--self-test') opts.selfTest = true;
  else if (arg === '-h' || arg === '--help') {
    process.stdout.write(`Usage: node scripts/run-claude-full-sequence.mjs [options]

Options:
  --case <id>             Run one case
  --max-cases <n>         Limit the number of cases
  --command <cmd>         Claude command to use (default: claude)
  --plugin-dir <path>     Plugin directory to force-load (default: repo root)
  --cases <path>          Full-sequence case JSON path
  --output-dir <path>     Where raw outputs and summaries are written
  --budget <usd>          Max spend per case (default: 5)
  --model <model>         Claude model alias (default: sonnet)
  --timeout-ms <ms>       Per-case timeout
  --self-test             Run deterministic runner helper checks, no Claude call

Example:
  npm run e2e:claude:full -- --command claude --max-cases 2
`);
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

function shellQuote(value) {
  if (value === '') return "''";
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function shellCommandName(value) {
  const command = String(value);
  return /^[A-Za-z0-9_./:-]+$/.test(command) ? command : shellQuote(command);
}

function runClaude(prompt, cwd) {
  const cliArgs = [
    '--plugin-dir',
    opts.pluginDir,
    '--permission-mode',
    'bypassPermissions',
    '--no-session-persistence',
    '--max-budget-usd',
    opts.budget,
    '--model',
    opts.model,
    '-p',
    prompt,
  ];
  const commandLine = [shellCommandName(opts.command), ...cliArgs.map(shellQuote)].join(' ');
  return spawnSync('/bin/zsh', ['-lic', commandLine], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
    timeout: opts.timeoutMs,
    env: {
      ...process.env,
      CLAUDE_PLUGIN_ROOT: opts.pluginDir,
      TERM:
        process.env.TERM && process.env.TERM !== 'dumb'
          ? process.env.TERM
          : 'xterm-256color',
    },
  });
}

function extractJson(text) {
  const candidates = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        candidates.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }
  for (const candidate of candidates.reverse()) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && parsed.decision) return parsed;
    } catch {
      /* try earlier candidates */
    }
  }
  return null;
}

function scanBadPhraseEcho(text) {
  const lower = String(text || '').toLowerCase();
  const hits = BAD_PHRASE_ECHOES.filter((phrase) => lower.includes(phrase));
  if (/—/.test(text || '')) hits.push('em dash');
  return hits;
}

function parseJson(stdout) {
  try {
    return { ok: true, value: JSON.parse(stdout), error: null };
  } catch (error) {
    return {
      ok: false,
      value: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function validateArtifact(caseDir) {
  const sequencePath = join(caseDir, 'sequencer-output.json');
  const finalPath = join(caseDir, 'final_sequence.md');
  if (!existsSync(sequencePath) || !existsSync(finalPath)) {
    return {
      isValid: false,
      errors: [
        {
          rule: 'missingFinalFiles',
          message: 'Expected final_sequence.md and sequencer-output.json.',
        },
      ],
      warnings: [],
    };
  }
  const result = spawnSync(
    'node',
    ['scripts/validate-artifact.mjs', '--sequence', sequencePath, '--final', finalPath],
    {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  if (result.status !== 0) {
    return {
      isValid: false,
      errors: [{ rule: 'artifactValidatorProcess', message: result.stderr || result.stdout }],
      warnings: [],
    };
  }
  const parsed = parseJson(result.stdout);
  if (!parsed.ok) {
    return {
      isValid: false,
      errors: [{ rule: 'artifactValidatorJson', message: parsed.error }],
      warnings: [],
    };
  }
  return parsed.value;
}

function buildPositivePrompt(testCase) {
  return `/event-outbound:event-outbound

Live full-sequence case ${testCase.id}: ${testCase.name}

Generate the full event-outbound sequence using the installed skill and the local validators.
Do not use web search for this live runner case. Treat the case request below as authoritative.
Write exactly these files in the current working directory:
- final_sequence.md
- sequencer-output.json

The JSON file must include top-level summary, event.startDate, event.endDate, and sequencesByPersona.
Every touch must include touch_slot, offset_days, send_date, channel, touch_type, subject, body,
cta_type, pain_angle, quality_band, validation_errors, and checks.

Run the artifact validator before your final response:
node "${opts.pluginDir}/scripts/validate-artifact.mjs" --sequence sequencer-output.json --final final_sequence.md

Use "ready for human review" only after the validator passes.
Return only JSON in your final response:
{
  "case_id": "${testCase.id}",
  "decision": "generated",
  "artifact_validator_is_valid": true,
  "output_files": ["final_sequence.md", "sequencer-output.json"]
}

Case request:
${JSON.stringify(testCase.request, null, 2)}
`;
}

function buildGuardPrompt(testCase) {
  return `/event-outbound:event-outbound

Live guard case ${testCase.id}: ${testCase.name}

Use the installed skill. If the request is too thin, impossible, or asks you to invent proof/assets,
do not draft outreach copy and do not write final_sequence.md or sequencer-output.json.
Ask for the missing facts or explain the block in one sentence.

Return only JSON:
{
  "case_id": "${testCase.id}",
  "decision": "blocked",
  "reason": "one sentence, ASCII only, no em dash"
}

Case request:
${JSON.stringify(testCase.request, null, 2)}
`;
}

function assertSelfTest(condition, message) {
  if (!condition) throw new Error(message);
}

function runSelfTest() {
  assertSelfTest(extractJson('{"decision":"blocked"}')?.decision === 'blocked', 'JSON extraction failed');
  assertSelfTest(
    scanBadPhraseEcho('Please compare notes later').includes('compare notes'),
    'bad phrase scan failed',
  );
  assertSelfTest(
    basename(DEFAULT_CASES) === 'claude-full-sequence-cases.json',
    'default case file changed unexpectedly',
  );
  process.stdout.write('run-claude-full-sequence self-test passed\n');
}

if (opts.selfTest) {
  runSelfTest();
  process.exit(0);
}

const cases = JSON.parse(readFileSync(opts.casesPath, 'utf8')).cases
  .filter((testCase) => !opts.caseId || testCase.id === opts.caseId)
  .slice(0, opts.maxCases ?? undefined);

if (opts.caseId && cases.length === 0) {
  throw new Error(`No full-sequence case matched ${opts.caseId}`);
}
if (cases.length === 0) {
  throw new Error('No full-sequence cases selected');
}

rmSync(opts.outputDir, { recursive: true, force: true });
mkdirSync(opts.outputDir, { recursive: true });

const summaries = [];

for (const testCase of cases) {
  const caseDir = join(opts.outputDir, testCase.id);
  mkdirSync(caseDir, { recursive: true });
  const prompt =
    testCase.kind === 'guard' ? buildGuardPrompt(testCase) : buildPositivePrompt(testCase);
  writeFileSync(join(caseDir, 'prompt.txt'), prompt);
  writeFileSync(join(caseDir, 'case.json'), JSON.stringify(testCase, null, 2));

  process.stdout.write(`Running full ${testCase.id} with ${opts.command}\n`);
  const result = runClaude(prompt, caseDir);
  writeFileSync(join(caseDir, 'claude-output.txt'), result.stdout || '');
  if (result.stderr) writeFileSync(join(caseDir, 'claude-stderr.txt'), result.stderr);

  const finalPath = join(caseDir, 'final_sequence.md');
  const sequencePath = join(caseDir, 'sequencer-output.json');
  const parsed = extractJson(result.stdout || '');
  const outputCorpus = [
    result.stdout || '',
    result.stderr || '',
    existsSync(finalPath) ? readFileSync(finalPath, 'utf8') : '',
    existsSync(sequencePath) ? readFileSync(sequencePath, 'utf8') : '',
  ].join('\n');
  const badPhraseEchoes = scanBadPhraseEcho(outputCorpus);
  const artifactValidation =
    testCase.kind === 'positive'
      ? validateArtifact(caseDir)
      : { isValid: false, errors: [], warnings: [] };

  let passed =
    result.status === 0 && parsed !== null && badPhraseEchoes.length === 0;
  if (testCase.kind === 'guard') {
    passed =
      passed &&
      parsed.decision === 'blocked' &&
      !existsSync(finalPath) &&
      !existsSync(sequencePath);
  } else {
    passed =
      passed &&
      parsed.decision === 'generated' &&
      existsSync(finalPath) &&
      existsSync(sequencePath) &&
      artifactValidation.isValid === true;
  }

  const summary = {
    id: testCase.id,
    name: testCase.name,
    kind: testCase.kind,
    exitStatus: result.status,
    timedOut: Boolean(result.error && result.error.code === 'ETIMEDOUT'),
    parsed: Boolean(parsed),
    decision: parsed?.decision ?? null,
    artifactValidatorIsValid: artifactValidation.isValid,
    artifactValidatorErrors: (artifactValidation.errors || []).map(
      (error) => error.rule,
    ),
    artifactValidatorWarnings: (artifactValidation.warnings || []).map(
      (warning) => warning.rule,
    ),
    badPhraseEchoes,
    passed,
  };
  summaries.push(summary);
  writeFileSync(join(caseDir, 'summary.json'), JSON.stringify(summary, null, 2));
}

const rollup = {
  command: opts.command,
  caseCount: summaries.length,
  passed: summaries.filter((summary) => summary.passed).length,
  failed: summaries.filter((summary) => !summary.passed).length,
  summaries,
};
writeFileSync(join(opts.outputDir, 'rollup.json'), JSON.stringify(rollup, null, 2));

if (rollup.failed > 0) {
  process.stderr.write(
    `${rollup.failed}/${rollup.caseCount} full-sequence cases failed. See ${opts.outputDir}/rollup.json\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `${rollup.passed}/${rollup.caseCount} full-sequence cases passed. Outputs: ${opts.outputDir}\n`,
);
