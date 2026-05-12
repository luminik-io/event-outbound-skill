#!/usr/bin/env node
// Final artifact validator for installed skill runs.
//
// Touch validation checks copy in isolation. Sequence validation checks angle
// diversity and cadence metadata. This script checks the whole deliverable:
// JSON shape, markdown hygiene, per-touch validator proof, date consistency,
// and surface-level phrases that make the final output feel unchecked.

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');

const args = process.argv.slice(2);
const opts = {
  sequencePath: null,
  finalPath: null,
  useStdin: false,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--sequence' && args[i + 1]) opts.sequencePath = args[++i];
  else if (arg === '--final' && args[i + 1]) opts.finalPath = args[++i];
  else if (arg === '--stdin') opts.useStdin = true;
  else if (arg === '-h' || arg === '--help') {
    process.stdout.write(`Usage: validate-artifact.mjs (--sequence <file> | --stdin) [--final <file>]

Returns JSON:
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "checks": {}
}
`);
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

let rawSequence;
if (opts.sequencePath) {
  rawSequence = readFileSync(opts.sequencePath, 'utf8');
} else if (opts.useStdin) {
  rawSequence = await readStdin();
} else {
  process.stderr.write(
    'validate-artifact: pass --sequence <file> or --stdin with JSON.\n',
  );
  process.exit(2);
}

let artifact;
try {
  artifact = JSON.parse(rawSequence);
} catch (error) {
  process.stderr.write(`validate-artifact: input is not valid JSON: ${error.message}\n`);
  process.exit(2);
}

const benchmarks = JSON.parse(
  readFileSync(join(DATA_DIR, 'cold-email-benchmarks.json'), 'utf8'),
);
const rules = JSON.parse(readFileSync(join(DATA_DIR, 'cold-outbound-rules.json'), 'utf8'));
const blocklist = rules.llm_cliche_blocklist || {};

const HARD_BAN_CATEGORIES = [
  'performative_empathy',
  'generic_compliments',
  'sales_speak_openers',
  'manufactured_intimacy',
  'marketing_buzzwords',
  'cold_email_overused',
  'lazy_generalization_openers',
  'llm_transition_tics',
  'gpt_vocabulary',
];

const TOUCH_TYPE_ALIASES = {
  email_cold: 'cold_email_first_touch',
  email_followup: 'cold_email_followup_2',
  email_followup_2: 'cold_email_followup_2',
  email_followup_3plus: 'cold_email_followup_3plus',
  email_day_of: 'cold_email_followup_3plus',
  email_post_event: 'post_event_followup',
  post_event: 'post_event_followup',
  linkedin_connect: 'linkedin_connection_request',
  linkedin_connection: 'linkedin_connection_request',
  linkedin_nudge: 'linkedin_day_of_nudge',
  linkedin_day_of: 'linkedin_day_of_nudge',
  linkedin_followup: 'post_event_followup',
  linkedin_post_event: 'post_event_followup',
};

const COPY_BANNED = [
  ...(benchmarks.banned_words_and_phrases || []),
  ...(rules.additional_banned_phrases || []),
  ...HARD_BAN_CATEGORIES.flatMap((category) =>
    Array.isArray(blocklist[category]) ? blocklist[category] : [],
  ),
];
const SURFACE_BANNED = [
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

const errors = [];
const warnings = [];
const checks = {
  personaCount: 0,
  touchCount: 0,
  touchValidatorPasses: 0,
  sequenceValidatorValid: null,
  finalMarkdownChecked: Boolean(opts.finalPath),
};

const lower = (value) => String(value || '').toLowerCase();
const canonicalTouchType = (touchType) =>
  touchType ? TOUCH_TYPE_ALIASES[touchType] || touchType : '';
const findHits = (text, phrases) => {
  const hay = lower(text);
  return phrases.filter((phrase) => phrase && hay.includes(lower(phrase)));
};
const readFinalMarkdown = () =>
  opts.finalPath ? readFileSync(opts.finalPath, 'utf8') : '';
const addError = (rule, message, extra = {}) => {
  errors.push({ rule, message, ...extra });
};
const addWarning = (rule, message, extra = {}) => {
  warnings.push({ rule, message, ...extra });
};
const parseValidatorStdout = (stdout) => {
  try {
    return { ok: true, value: JSON.parse(stdout), error: null };
  } catch (error) {
    return {
      ok: false,
      value: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
const stringValueEntries = (value, path = '$') => {
  if (typeof value === 'string') return [{ path, value }];
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => stringValueEntries(item, `${path}[${index}]`));
  }
  return Object.entries(value).flatMap(([key, item]) =>
    stringValueEntries(item, `${path}.${key}`),
  );
};
const eventNameFor = (inputValue, sequence) =>
  inputValue.eventName ||
  inputValue.event?.name ||
  inputValue.eventContext?.name ||
  sequence?.eventName ||
  sequence?.event?.name ||
  '';
const eventLocationFor = (inputValue, sequence) =>
  inputValue.eventLocation ||
  inputValue.event?.location ||
  inputValue.eventContext?.location ||
  sequence?.eventLocation ||
  sequence?.event?.location ||
  '';
const sequenceAvailableAssets = (inputValue, sequence) =>
  sequence?.availableAssets ||
  sequence?.available_assets ||
  inputValue.availableAssets ||
  inputValue.available_assets ||
  inputValue.brief?.availableAssets ||
  [];
const sequenceProofPoints = (inputValue, sequence) =>
  sequence?.proofPoints ||
  sequence?.proof_points ||
  inputValue.proofPoints ||
  inputValue.proof_points ||
  inputValue.brief?.proofPoints ||
  [];
const painAngleContext = (touch) => {
  const angle = touch?.pain_angle || {};
  return [
    angle.label,
    angle.sourcePain || angle.source_pain,
    angle.mechanism,
    angle.costOfInaction || angle.cost_of_inaction,
  ].filter(Boolean);
};
const touchOffset = (touch) =>
  typeof touch.offset_days === 'number'
    ? touch.offset_days
    : typeof touch.send_at_offset_days === 'number'
      ? touch.send_at_offset_days
      : null;
const isObjectRecord = (value) =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

function validateSurfaceText(label, text) {
  if (!text) return;
  if (/—/.test(text)) {
    addError('surfaceEmDash', 'Final output contains an em dash.', {
      label,
      offendingValue: 'em dash',
    });
  }
  const hits = findHits(text, SURFACE_BANNED);
  if (hits.length > 0) {
    addError('surfaceBannedPhrase', 'Final output contains banned surface phrasing.', {
      label,
      offendingValue: hits.join(', '),
    });
  }
}

function validateCopyText(personaId, slot, text) {
  const hits = findHits(text, COPY_BANNED);
  if (hits.length > 0) {
    addError('copyBannedPhrase', 'Touch copy contains banned phrasing.', {
      personaId,
      touchSlot: slot,
      offendingValue: hits.slice(0, 8).join(', '),
    });
  }
  if (/—/.test(text)) {
    addError('copyEmDash', 'Touch copy contains an em dash.', {
      personaId,
      touchSlot: slot,
    });
  }
}

function validateTouchShape(personaId, touch, index) {
  if (!isObjectRecord(touch)) {
    addError('touchShape', 'Every touch must be an object.', {
      personaId,
      touchSlot: index + 1,
      offendingValue: JSON.stringify(touch),
    });
    return false;
  }
  const slot = touch.touch_slot ?? index + 1;
  const required = ['channel', 'touch_type', 'subject', 'body', 'cta_type'];
  for (const field of required) {
    if (touch[field] === undefined || touch[field] === null) {
      addError('touchMissingField', `Touch is missing ${field}.`, {
        personaId,
        touchSlot: slot,
      });
    }
  }
  if (touch.painAngle !== undefined) {
    addError('camelCasePainAngle', 'Use pain_angle, not painAngle, in final JSON.', {
      personaId,
      touchSlot: slot,
    });
  }
  if (!touch.pain_angle) {
    addError('missingPainAngle', 'Every final touch must include pain_angle metadata.', {
      personaId,
      touchSlot: slot,
    });
  }
  if (!touch.checks || typeof touch.checks !== 'object') {
    addError('missingChecks', 'Every final touch must include the actual checks object.', {
      personaId,
      touchSlot: slot,
    });
  }
  if (!Object.prototype.hasOwnProperty.call(touch, 'validation_errors')) {
    addError(
      'missingValidationErrors',
      'Every final touch must include validation_errors, even when empty.',
      { personaId, touchSlot: slot },
    );
  } else if (
    !Array.isArray(touch.validation_errors) ||
    touch.validation_errors.length > 0
  ) {
    addError('nonEmptyValidationErrors', 'Final touches must not carry errors.', {
      personaId,
      touchSlot: slot,
      offendingValue: JSON.stringify(touch.validation_errors),
    });
  }
  if (touch.send_date === undefined) {
    addError('missingSendDate', 'Every final touch must include send_date.', {
      personaId,
      touchSlot: slot,
    });
  }
  if (touchOffset(touch) === null) {
    addError('missingOffsetDays', 'Every final touch must include offset_days.', {
      personaId,
      touchSlot: slot,
    });
  }
  if (!canonicalTouchType(touch.touch_type)) {
    addError('missingTouchType', 'Every final touch needs a canonical touch_type.', {
      personaId,
      touchSlot: slot,
    });
  }
  if (/\n\s*\n\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\s*$/.test(touch.body || '')) {
    addError('signatureBlock', 'touch.body must not include a sender signature.', {
      personaId,
      touchSlot: slot,
    });
  }
  if (/^\s*(?:hi|hey|hello)\s+\{\{first_name\}\}\s*,/i.test(touch.body || '')) {
    addError('templateGreeting', 'Do not open generated bodies with Hi/Hey/Hello.', {
      personaId,
      touchSlot: slot,
    });
  }
  validateCopyText(personaId, slot, `${touch.subject || ''}\n${touch.body || ''}`);
  return true;
}

function validateTouchWithCli(inputValue, sequence, personaId, touch, usedPainAngles) {
  const slot = touch.touch_slot ?? usedPainAngles.length + 1;
  const payload = {
    subject: touch.subject ?? '',
    body: touch.body ?? '',
    channel: touch.channel,
    touch_type: touch.touch_type,
    cta_type: touch.cta_type,
    eventName: eventNameFor(inputValue, sequence),
    eventLocation: eventLocationFor(inputValue, sequence),
    personaPriorities:
      touch.personaPriorities ||
      sequence.personaPriorities ||
      inputValue.personaPriorities ||
      painAngleContext(touch),
    personaPainPoints:
      touch.personaPainPoints ||
      sequence.personaPainPoints ||
      inputValue.personaPainPoints ||
      painAngleContext(touch),
    strictTruth: inputValue.strictTruth !== false,
    availableAssets: sequenceAvailableAssets(inputValue, sequence),
    proofPoints: sequenceProofPoints(inputValue, sequence),
    strictAngleDiversity: true,
    painAngle: touch.pain_angle,
    pain_angle: touch.pain_angle,
    usedPainAngles,
    used_pain_angles: usedPainAngles,
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    cwd: ROOT,
    input: JSON.stringify(payload),
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) {
    addError('touchValidatorProcess', 'Touch validator failed to run.', {
      personaId,
      touchSlot: slot,
      offendingValue: result.stderr || result.stdout,
    });
    return;
  }
  const parsed = parseValidatorStdout(result.stdout);
  if (!parsed.ok) {
    addError('touchValidatorJson', 'Touch validator returned invalid JSON.', {
      personaId,
      touchSlot: slot,
      offendingValue: parsed.error,
    });
    return;
  }
  if (parsed.value.isValid !== true) {
    addError('touchValidatorFailed', 'Final touch fails validate-touch.mjs.', {
      personaId,
      touchSlot: slot,
      offendingValue: (parsed.value.errors || []).map((error) => error.rule).join(', '),
    });
  } else {
    checks.touchValidatorPasses += 1;
  }
}

if (!artifact.summary || typeof artifact.summary !== 'object') {
  addError('missingSummary', 'sequencer-output.json must include a top-level summary.');
}
if (!artifact.sequencesByPersona || typeof artifact.sequencesByPersona !== 'object') {
  addError(
    'missingSequencesByPersona',
    'sequencer-output.json must include sequencesByPersona.',
  );
}
if (
  !(
    artifact.eventStartDate ||
    artifact.event?.startDate ||
    artifact.eventContext?.startDate
  )
) {
  addError('missingEventStartDate', 'Final JSON must include the event start date.');
}

validateSurfaceText('sequencer-output.json', rawSequence);
if (opts.finalPath) validateSurfaceText('final_sequence.md', readFinalMarkdown());

for (const entry of stringValueEntries(artifact)) {
  const hits = findHits(entry.value, SURFACE_BANNED);
  if (hits.length > 0) {
    addError('metadataBannedPhrase', 'JSON metadata contains banned surface phrasing.', {
      path: entry.path,
      offendingValue: hits.join(', '),
    });
  }
}

for (const [personaId, sequence] of Object.entries(artifact.sequencesByPersona || {})) {
  checks.personaCount += 1;
  if (!sequence || typeof sequence !== 'object') {
    addError('sequenceShape', 'Each persona sequence must be an object.', { personaId });
    continue;
  }
  for (const field of ['personaId', 'leadTimeWeeks', 'channels', 'touches']) {
    if (sequence[field] === undefined || sequence[field] === null) {
      addError('sequenceMissingField', `Sequence is missing ${field}.`, { personaId });
    }
  }
  if (!Array.isArray(sequence.touches)) {
    addError('sequenceTouchesShape', 'Sequence touches must be an array.', { personaId });
    continue;
  }
  checks.touchCount += sequence.touches.length;
  const usedPainAngles = [];
  for (let index = 0; index < sequence.touches.length; index += 1) {
    const touch = sequence.touches[index];
    if (!validateTouchShape(personaId, touch, index)) continue;
    validateTouchWithCli(artifact, sequence, personaId, touch, usedPainAngles);
    if (touch.pain_angle) usedPainAngles.push(touch.pain_angle);
  }
  const proofBodies = new Map();
  for (const touch of sequence.touches) {
    if (!isObjectRecord(touch)) continue;
    const body = lower(touch.body || '');
    for (const proof of sequenceProofPoints(artifact, sequence)) {
      const proofWords = lower(proof)
        .split(/\s+/)
        .filter((word) => word.length > 5)
        .slice(0, 4)
        .join(' ');
      if (!proofWords) continue;
      const count = proofBodies.get(proofWords) || 0;
      if (body.includes(proofWords)) proofBodies.set(proofWords, count + 1);
    }
  }
  for (const [proof, count] of proofBodies.entries()) {
    if (count > 1) {
      addWarning('proofRepeated', 'The same proof point appears in more than one touch.', {
        personaId,
        offendingValue: proof,
      });
    }
  }
}

const sequenceResult = spawnSync('node', ['scripts/validate-sequence.mjs', '--stdin'], {
  cwd: ROOT,
  input: rawSequence,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
});
if (sequenceResult.status !== 0) {
  addError('sequenceValidatorProcess', 'Sequence validator failed to run.', {
    offendingValue: sequenceResult.stderr || sequenceResult.stdout,
  });
} else {
  const parsed = parseValidatorStdout(sequenceResult.stdout);
  if (!parsed.ok) {
    addError('sequenceValidatorJson', 'Sequence validator returned invalid JSON.', {
      offendingValue: parsed.error,
    });
  } else {
    checks.sequenceValidatorValid = parsed.value.isValid === true;
    if (parsed.value.isValid !== true) {
      addError('sequenceValidatorFailed', 'Final sequence fails validate-sequence.mjs.', {
        offendingValue: (parsed.value.errors || []).map((error) => error.rule).join(', '),
      });
    }
    checks.sequenceValidatorChecks = parsed.value.checks;
  }
}

process.stdout.write(
  JSON.stringify(
    {
      isValid: errors.length === 0,
      errors,
      warnings,
      checks,
    },
    null,
    2,
  ) + '\n',
);
