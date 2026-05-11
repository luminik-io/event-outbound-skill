#!/usr/bin/env node
// Optional live Claude matrix runner.
//
// This is deliberately outside `npm run verify`: it needs local Claude auth and
// model output is nondeterministic. It is useful before publishing the skill:
// lite mode checks that no-tools runs block instead of drafting, and validated
// mode checks that Claude can write a touch, run the local validator, and pass.

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
const DEFAULT_CASES = join(ROOT, 'scripts', 'claude-matrix-cases.json');
const DEFAULT_OUTPUT = join(ROOT, '.tmp', 'claude-matrix-live');
const BAD_PHRASE_ECHOES = [
  'open to a look',
  'quick question',
  'circling back',
  'touching base',
  'no pressure',
  'separate thread',
  'earlier note',
  'previous note',
  'following up on my',
  'worth pressure-testing before',
  'hope this finds you',
  'hope the event went well',
  'coffee in amsterdam',
  'compare notes',
];

const args = process.argv.slice(2);
const opts = {
  command: 'claude',
  pluginDir: ROOT,
  casesPath: DEFAULT_CASES,
  outputDir: DEFAULT_OUTPUT,
  mode: 'validated',
  caseId: null,
  maxCases: null,
  budget: '2',
  model: 'sonnet',
  timeoutMs: null,
  selfTest: false,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--command') opts.command = args[++i];
  else if (arg === '--plugin-dir') opts.pluginDir = resolve(args[++i]);
  else if (arg === '--cases') opts.casesPath = resolve(args[++i]);
  else if (arg === '--output-dir') opts.outputDir = resolve(args[++i]);
  else if (arg === '--mode') opts.mode = args[++i];
  else if (arg === '--case') opts.caseId = args[++i];
  else if (arg === '--max-cases') opts.maxCases = Number(args[++i]);
  else if (arg === '--budget') opts.budget = args[++i];
  else if (arg === '--model') opts.model = args[++i];
  else if (arg === '--timeout-ms') opts.timeoutMs = Number(args[++i]);
  else if (arg === '--self-test') opts.selfTest = true;
  else if (arg === '-h' || arg === '--help') {
    process.stdout.write(`Usage: node scripts/run-claude-matrix.mjs [options]

Options:
  --mode <lite|validated>    lite blocks with tools disabled, validated drafts one checked touch
  --case <id>                Run one case
  --max-cases <n>            Limit the number of cases
  --command <cmd>            Claude command to use (default: claude)
  --plugin-dir <path>        Plugin directory to force-load (default: repo root)
  --cases <path>             Matrix case JSON path
  --output-dir <path>        Where raw outputs and summaries are written
  --budget <usd>             Max spend per case (default: 2)
  --model <model>            Claude model alias (default: sonnet)
  --timeout-ms <ms>          Per-case timeout
  --self-test                Run deterministic runner helper checks, no Claude call

Examples:
  npm run e2e:claude:matrix -- --mode lite --max-cases 24
  npm run e2e:claude:matrix -- --mode validated --max-cases 5
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

function runClaude(prompt, cwd, timeoutMs) {
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
  ];
  if (opts.mode === 'lite') {
    cliArgs.push('--tools', '');
  }
  cliArgs.push('-p', prompt);

  const commandLine = [shellCommandName(opts.command), ...cliArgs.map(shellQuote)].join(' ');
  return spawnSync('/bin/zsh', ['-lic', commandLine], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
    timeout: timeoutMs,
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
  const lower = text.toLowerCase();
  return BAD_PHRASE_ECHOES.filter((phrase) => lower.includes(phrase));
}

function readJsonFileSafe(filePath) {
  if (!existsSync(filePath)) {
    return {
      ok: false,
      error: { rule: 'missingOutputFile', message: `${basename(filePath)} not found` },
      value: null,
    };
  }
  try {
    return { ok: true, value: JSON.parse(readFileSync(filePath, 'utf8')), error: null };
  } catch (err) {
    return {
      ok: false,
      value: null,
      error: {
        rule: 'invalidOutputJson',
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

function requestedTouchErrors(testCase, touch) {
  const errors = [];
  const requested = testCase.requestedTouch || {};
  for (const field of ['channel', 'touch_type', 'cta_type']) {
    if (requested[field] && touch?.[field] !== requested[field]) {
      errors.push({
        rule: `requestedTouch.${field}`,
        message: `Generated ${field} '${touch?.[field] ?? ''}' did not match requested '${requested[field]}'.`,
        offendingValue: touch?.[field] ?? '',
      });
    }
  }
  return errors;
}

function buildValidatorPayload(testCase, touch) {
  const context = testCase.validatorContext || {};
  const painAngle = touch?.painAngle ?? touch?.pain_angle ?? context.painAngle;
  const usedPainAngles =
    context.usedPainAngles ?? context.used_pain_angles ?? [];
  return {
    subject: touch?.subject ?? '',
    body: touch?.body ?? '',
    channel: touch?.channel,
    touch_type: touch?.touch_type,
    cta_type: touch?.cta_type,
    ...context,
    painAngle,
    pain_angle: painAngle,
    usedPainAngles,
    used_pain_angles: usedPainAngles,
  };
}

function parseValidatorStdout(stdout) {
  try {
    return {
      ok: true,
      value: JSON.parse(stdout),
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      value: null,
      error: {
        rule: 'invalidValidatorJson',
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

function validateTouchFile(testCase, filePath) {
  const generated = readJsonFileSafe(filePath);
  if (!generated.ok) {
    return {
      isValid: false,
      errors: [generated.error],
      checks: {},
      generatedTouch: null,
    };
  }
  const touch = generated.value;
  const shapeErrors = requestedTouchErrors(testCase, touch);
  const payload = buildValidatorPayload(testCase, touch);
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    cwd: ROOT,
    input: JSON.stringify(payload),
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) {
    return {
      isValid: false,
      errors: [
        ...shapeErrors,
        { rule: 'validatorProcess', message: result.stderr || result.stdout },
      ],
      checks: {},
      generatedTouch: touch,
    };
  }
  const parsed = parseValidatorStdout(result.stdout);
  if (!parsed.ok) {
    return {
      isValid: false,
      errors: [...shapeErrors, parsed.error],
      checks: {},
      generatedTouch: touch,
    };
  }
  return {
    ...parsed.value,
    isValid: parsed.value.isValid === true && shapeErrors.length === 0,
    errors: [...shapeErrors, ...(parsed.value.errors || [])],
    generatedTouch: touch,
  };
}

function assertSelfTest(condition, message) {
  if (!condition) throw new Error(message);
}

function runSelfTest() {
  const fakeCase = {
    requestedTouch: {
      channel: 'email',
      touch_type: 'cold_email_first_touch',
      cta_type: 'ask_for_interest',
    },
    validatorContext: {
      eventName: 'Money20/20 Europe 2026',
      eventLocation: 'Amsterdam',
      personaPriorities: ['reconcile instant-payment evidence'],
      personaPainPoints: ['evidence owner is unclear'],
      strictTruth: true,
      availableAssets: [],
      proofPoints: [],
      strictAngleDiversity: true,
      usedPainAngles: [],
    },
  };
  const generatedTouch = {
    subject: '',
    body: 'placeholder',
    channel: 'linkedin',
    touch_type: 'linkedin_connection_request',
    cta_type: 'ask_for_interest',
    strictTruth: false,
    availableAssets: ['invented asset'],
    proofPoints: ['invented proof'],
  };
  const payload = buildValidatorPayload(fakeCase, generatedTouch);
  assertSelfTest(payload.strictTruth === true, 'validator context must be authoritative');
  assertSelfTest(payload.availableAssets.length === 0, 'touch must not override assets');
  assertSelfTest(payload.proofPoints.length === 0, 'touch must not override proof');
  const shapeErrors = requestedTouchErrors(fakeCase, generatedTouch);
  assertSelfTest(shapeErrors.length === 2, 'channel and touch_type mismatch must be flagged');

  mkdirSync(DEFAULT_OUTPUT, { recursive: true });
  const invalidPath = join(DEFAULT_OUTPUT, 'matrix-self-test-invalid.json');
  writeFileSync(invalidPath, '{not valid json');
  const invalid = readJsonFileSafe(invalidPath);
  rmSync(invalidPath, { force: true });
  assertSelfTest(invalid.ok === false, 'invalid JSON must return a structured error');
  assertSelfTest(extractJson('no json here') === null, 'missing final JSON must return null');
  process.stdout.write('run-claude-matrix self-test passed\n');
}

function buildLitePrompt(testCase) {
  return `/event-outbound:event-outbound

Live matrix case ${testCase.id}: ${testCase.name}

Tools are intentionally disabled for this run. Obey the skill's validation gate:
do not draft outreach copy, do not invent a sequence, and do not repeat banned phrase examples.

Return only JSON:
{
  "case_id": "${testCase.id}",
  "decision": "blocked",
  "reason": "one sentence explaining that validator/tool access is unavailable"
}

Case context:
${JSON.stringify(testCase.context, null, 2)}
`;
}

function buildValidatedPrompt(testCase) {
  return `/event-outbound:event-outbound

Live matrix case ${testCase.id}: ${testCase.name}

Generate exactly one outreach touch for the requested channel and touch type below. This is a local
validator exercise, not a full sequence. Use the event-outbound skill and run the local validator:

node "${opts.pluginDir}/scripts/validate-touch.mjs" --stdin

Rules for this run:
- Write a file named validated-touch.json in the current working directory.
- The file must contain subject, body, channel, touch_type, cta_type, eventName, eventLocation,
  personaPriorities, personaPainPoints, strictTruth, availableAssets, proofPoints,
  strictAngleDiversity, painAngle, and usedPainAngles.
- If validation fails, revise and re-run up to 3 attempts.
- Do not include copy in your final message unless the file passed the validator.
- Return only JSON with decision "validated" when the actual validator returns isValid true.

Requested touch:
${JSON.stringify(testCase.requestedTouch, null, 2)}

Validator context:
${JSON.stringify(testCase.validatorContext, null, 2)}

Buyer and event context:
${JSON.stringify(testCase.context, null, 2)}

Final response JSON shape:
{
  "case_id": "${testCase.id}",
  "decision": "validated",
  "reason": "one sentence",
  "output_file": "validated-touch.json",
  "validator_is_valid": true,
  "validator_errors": []
}
`;
}

const timeoutMs =
  opts.timeoutMs ?? (opts.mode === 'validated' ? 300_000 : 120_000);
const summaries = [];

if (opts.selfTest) {
  runSelfTest();
  process.exit(0);
}

if (!['lite', 'validated'].includes(opts.mode)) {
  throw new Error(`--mode must be lite or validated, got ${opts.mode}`);
}

const cases = JSON.parse(readFileSync(opts.casesPath, 'utf8')).cases
  .filter((testCase) => !opts.caseId || testCase.id === opts.caseId)
  .filter((testCase) =>
    opts.mode === 'lite'
      ? testCase.lite !== false
      : testCase.validated !== false && testCase.kind !== 'guard',
  )
  .slice(0, opts.maxCases ?? undefined);

if (opts.caseId && cases.length === 0) {
  throw new Error(`No matrix case matched ${opts.caseId} for mode ${opts.mode}`);
}
if (cases.length === 0) {
  throw new Error(`No matrix cases selected for mode ${opts.mode}`);
}

const modeOutputDir = join(opts.outputDir, opts.mode);
rmSync(modeOutputDir, { recursive: true, force: true });
mkdirSync(modeOutputDir, { recursive: true });

for (const testCase of cases) {
  const caseDir = join(modeOutputDir, testCase.id);
  mkdirSync(caseDir, { recursive: true });
  const prompt = opts.mode === 'lite' ? buildLitePrompt(testCase) : buildValidatedPrompt(testCase);
  writeFileSync(join(caseDir, 'prompt.txt'), prompt);
  writeFileSync(join(caseDir, 'case.json'), JSON.stringify(testCase, null, 2));

  process.stdout.write(`Running ${opts.mode} ${testCase.id} with ${opts.command}\n`);
  const result = runClaude(prompt, caseDir, timeoutMs);
  writeFileSync(join(caseDir, 'claude-output.txt'), result.stdout || '');
  if (result.stderr) writeFileSync(join(caseDir, 'claude-stderr.txt'), result.stderr);

  const parsed = extractJson(result.stdout || '');
  const outputFile = join(caseDir, 'validated-touch.json');
  const validation =
    opts.mode === 'validated'
      ? validateTouchFile(testCase, outputFile)
      : { isValid: false, errors: [], checks: {} };
  const outputCorpus =
    `${result.stdout || ''}\n${result.stderr || ''}\n` +
    (existsSync(outputFile) ? readFileSync(outputFile, 'utf8') : '');
  const badPhraseEchoes = scanBadPhraseEcho(outputCorpus);

  let passed = result.status === 0 && parsed !== null && badPhraseEchoes.length === 0;
  if (opts.mode === 'lite') {
    passed = passed && parsed.decision === 'blocked' && !existsSync(outputFile);
  } else {
    passed =
      passed &&
      parsed.decision === 'validated' &&
      existsSync(outputFile) &&
      validation.isValid === true;
  }

  const summary = {
    id: testCase.id,
    name: testCase.name,
    mode: opts.mode,
    exitStatus: result.status,
    timedOut: Boolean(result.error && result.error.code === 'ETIMEDOUT'),
    decision: parsed?.decision ?? null,
    parsed: Boolean(parsed),
    validatorIsValid: validation.isValid,
    validatorErrors: (validation.errors || []).map((error) => error.rule),
    badPhraseEchoes,
    passed,
  };
  summaries.push(summary);
  writeFileSync(join(caseDir, 'summary.json'), JSON.stringify(summary, null, 2));
}

const rollup = {
  mode: opts.mode,
  command: opts.command,
  caseCount: summaries.length,
  passed: summaries.filter((summary) => summary.passed).length,
  failed: summaries.filter((summary) => !summary.passed).length,
  summaries,
};
writeFileSync(join(modeOutputDir, 'rollup.json'), JSON.stringify(rollup, null, 2));

if (rollup.failed > 0) {
  process.stderr.write(
    `${rollup.failed}/${rollup.caseCount} ${opts.mode} cases failed. See ${modeOutputDir}/rollup.json\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `${rollup.passed}/${rollup.caseCount} ${opts.mode} cases passed. Outputs: ${modeOutputDir}\n`,
);
