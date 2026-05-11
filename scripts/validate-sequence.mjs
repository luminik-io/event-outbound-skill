#!/usr/bin/env node
// Sequence-level validator for event-outbound outputs.
//
// Touch-level checks catch bad copy in isolation. This file catches the
// sequence failure mode that matters most in multi-touch outbound: reusing the
// same buyer pain across email and LinkedIn steps.
//
// Usage:
//   node scripts/validate-sequence.mjs --sequence examples/foo/sequencer-output.json
//   cat sequencer-output.json | node scripts/validate-sequence.mjs --stdin

import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
let sequencePath = null;
let useStdin = false;

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--sequence' && argv[i + 1]) {
    sequencePath = argv[++i];
  } else if (arg === '--stdin') {
    useStdin = true;
  } else if (arg === '-h' || arg === '--help') {
    process.stdout.write(
      'Usage: validate-sequence.mjs (--sequence <file> | --stdin)\n',
    );
    process.exit(0);
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

let raw;
if (sequencePath) {
  raw = readFileSync(sequencePath, 'utf8');
} else if (useStdin) {
  raw = await readStdin();
} else {
  process.stderr.write(
    'validate-sequence: pass --sequence <file> or --stdin with JSON.\n',
  );
  process.exit(2);
}

let input;
try {
  input = JSON.parse(raw);
} catch (error) {
  process.stderr.write(`validate-sequence: input is not valid JSON: ${error.message}\n`);
  process.exit(2);
}

const STOPWORDS = new Set([
  'about',
  'across',
  'after',
  'again',
  'against',
  'also',
  'before',
  'being',
  'between',
  'could',
  'every',
  'from',
  'have',
  'into',
  'just',
  'like',
  'more',
  'most',
  'need',
  'only',
  'over',
  'sent',
  'still',
  'that',
  'their',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'today',
  'touch',
  'using',
  'what',
  'when',
  'where',
  'which',
  'while',
  'with',
  'without',
  'would',
  'your',
]);

const lower = (value) => String(value || '').toLowerCase();
const angleText = (angle) => {
  if (!angle) return '';
  if (typeof angle === 'string') return angle;
  return [
    angle.label,
    angle.sourcePain || angle.source_pain,
    angle.mechanism,
    angle.costOfInaction || angle.cost_of_inaction,
    angle.illuminationQuestion || angle.illumination_question,
  ]
    .filter(Boolean)
    .join(' ');
};
const angleLabel = (angle) => {
  if (!angle) return '';
  if (typeof angle === 'string') return angle;
  return angle.label || angle.sourcePain || angle.source_pain || '';
};
const tokens = (text) => {
  const rawTokens =
    lower(text)
      .replace(/\{\{[a-z0-9_]+\}\}/g, ' ')
      .match(/[a-z0-9]+(?:[-/][a-z0-9]+)*/g) || [];
  return Array.from(
    new Set(
      rawTokens
        .map((token) =>
          token
            .replace(/(?:ing|tion|sion|ment|ness|ities|ity|ed|es|s)$/i, '')
            .replace(/[-/]/g, ''),
        )
        .filter((token) => token.length >= 4 && !STOPWORDS.has(token)),
    ),
  );
};
const similarity = (a, b) => {
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) intersection++;
  }
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
};
const normalizedLabel = (angle) => tokens(angleLabel(angle)).join(' ');
const sharesBody = (angle, body) => {
  const angleTokens = tokens(angleText(angle));
  if (angleTokens.length === 0) return false;
  const bodyTokens = new Set(tokens(body));
  return angleTokens.some((token) => bodyTokens.has(token));
};
const bodySimilarity = (leftBody, rightBody) => {
  const left = new Set(tokens(leftBody));
  const right = new Set(tokens(rightBody));
  if (left.size === 0 || right.size === 0) return { score: 0, shared: [] };
  const shared = [...left].filter((token) => right.has(token));
  const union = new Set([...left, ...right]).size;
  return { score: union === 0 ? 0 : shared.length / union, shared };
};

const errors = [];
const checks = {
  sequences: {},
};

for (const [personaId, sequence] of Object.entries(input.sequencesByPersona || {})) {
  const touches = sequence.touches || [];
  const usedAngles = [];
  const usedLabels = new Map();
  const pairSimilarities = [];
  checks.sequences[personaId] = {
    touchCount: touches.length,
    painAngleLabels: [],
    distinctPainAngleCount: 0,
    pairSimilarities,
  };

  for (let index = 0; index < touches.length; index++) {
    const touch = touches[index];
    const slot = touch.touch_slot ?? index + 1;
    const angle = touch.pain_angle || touch.painAngle;
    const label = angleLabel(angle);
    const normalized = normalizedLabel(angle);
    checks.sequences[personaId].painAngleLabels.push(label || null);

    if (!angle || !label.trim()) {
      errors.push({
        rule: 'missingPainAngle',
        personaId,
        touchSlot: slot,
        message:
          'Every touch must carry pain_angle metadata so the sequence can prove it is not recycling the same pain.',
      });
      continue;
    }

    if (!sharesBody(angle, touch.body || '')) {
      errors.push({
        rule: 'painAngleMismatch',
        personaId,
        touchSlot: slot,
        offendingValue: label,
        message:
          'Touch declares a pain angle, but the body does not visibly use it.',
      });
    }

    if (normalized && usedLabels.has(normalized)) {
      errors.push({
        rule: 'painAngleReused',
        personaId,
        touchSlot: slot,
        offendingValue: label,
        message: `Pain angle duplicates touch ${usedLabels.get(normalized)}.`,
      });
    }

    for (const previous of usedAngles) {
      const angleScore = similarity(angleText(angle), angleText(previous.angle));
      const bodyScore = bodySimilarity(touch.body || '', previous.body || '');
      pairSimilarities.push({
        leftTouchSlot: previous.slot,
        rightTouchSlot: slot,
        angleSimilarity: Number(angleScore.toFixed(2)),
        bodySimilarity: Number(bodyScore.score.toFixed(2)),
        sharedBodyTokens: bodyScore.shared.slice(0, 12),
      });
      if (angleScore >= 0.42) {
        errors.push({
          rule: 'painAngleReused',
          personaId,
          touchSlot: slot,
          offendingValue: `${label} ~= ${angleLabel(previous.angle)}`,
          message:
            'Pain angle metadata is too similar to an earlier touch.',
        });
      }
      if (bodyScore.score >= 0.35 && bodyScore.shared.length >= 6) {
        errors.push({
          rule: 'touchPainSimilarity',
          personaId,
          touchSlot: slot,
          offendingValue: bodyScore.shared.slice(0, 12).join(', '),
          message:
            'Touch body repeats too much pain vocabulary from an earlier touch.',
        });
      }
    }

    if (normalized) usedLabels.set(normalized, slot);
    usedAngles.push({ slot, angle, body: touch.body || '' });
  }

  checks.sequences[personaId].distinctPainAngleCount = new Set(
    checks.sequences[personaId].painAngleLabels.filter(Boolean).map((label) =>
      lower(label).replace(/[^a-z0-9]+/g, ' ').trim(),
    ),
  ).size;

  if (
    touches.length > 1 &&
    checks.sequences[personaId].distinctPainAngleCount < touches.length
  ) {
    errors.push({
      rule: 'distinctPainAngleCount',
      personaId,
      message: `Expected ${touches.length} distinct pain angles, got ${checks.sequences[personaId].distinctPainAngleCount}.`,
    });
  }
}

process.stdout.write(
  JSON.stringify({ isValid: errors.length === 0, errors, checks }, null, 2) + '\n',
);
