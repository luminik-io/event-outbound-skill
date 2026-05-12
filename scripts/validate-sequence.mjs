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

const canonicalTouchType = (touchType) =>
  touchType ? TOUCH_TYPE_ALIASES[touchType] || touchType : '';
const lower = (value) => String(value || '').toLowerCase();
const parseDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const dayDiff = (left, right) =>
  Math.round((left.getTime() - right.getTime()) / (24 * 60 * 60 * 1000));
const eventStartDateFor = (inputValue, sequence) =>
  parseDateOnly(
    inputValue.eventStartDate ||
      inputValue.event?.startDate ||
      inputValue.eventContext?.startDate ||
      sequence.eventStartDate ||
      sequence.event?.startDate ||
      sequence.eventContext?.startDate,
  );
const eventEndDateFor = (inputValue, sequence, startDate) =>
  parseDateOnly(
    inputValue.eventEndDate ||
      inputValue.event?.endDate ||
      inputValue.eventContext?.endDate ||
      sequence.eventEndDate ||
      sequence.event?.endDate ||
      sequence.eventContext?.endDate,
  ) || startDate;
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
const orderedTokens = (text) =>
  lower(text)
    .replace(/\{\{[a-z0-9_]+\}\}/g, ' ')
    .match(/[a-z0-9]+(?:[-/][a-z0-9]+)*/g)
    ?.map((token) =>
      (token.length > 4
        ? token.replace(/(?:ing|tion|sion|ment|ness|ities|ity|ed|es|s)$/i, '')
        : token
      ).replace(/[-/]/g, ''),
    )
    .filter((token) => token.length >= 3) || [];
const normalizedCorpus = (text) => ` ${orderedTokens(text).join(' ')} `;
const painAnchorPhrases = (text) => {
  const words = orderedTokens(text);
  const phrases = new Set();
  for (let size = 3; size <= 5; size += 1) {
    for (let index = 0; index <= words.length - size; index += 1) {
      const phraseWords = words.slice(index, index + size);
      const signalWords = phraseWords.filter(
        (word) => word.length >= 4 && !STOPWORDS.has(word),
      );
      if (signalWords.length >= 2) phrases.add(phraseWords.join(' '));
    }
  }
  return Array.from(phrases);
};
const repeatedPainAnchorHits = (previousAngle, currentBody) => {
  const body = normalizedCorpus(currentBody);
  return painAnchorPhrases(angleText(previousAngle)).filter((phrase) =>
    body.includes(` ${phrase} `),
  );
};
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const eventAliases = (inputValue, sequence) => {
  const raw =
    inputValue.eventName ||
    inputValue.event?.name ||
    inputValue.eventContext?.name ||
    sequence.eventName ||
    sequence.event?.name ||
    '';
  const name = lower(raw);
  const aliases = new Set(['{{event_name}}']);
  if (name.includes('rsa')) {
    aliases.add('rsa');
    aliases.add('rsa conference');
  }
  if (name.includes('money20/20') || name.includes('money2020')) {
    aliases.add('money20/20');
    aliases.add('money2020');
    aliases.add('m20/20');
  }
  if (name.includes('black hat') || name.includes('blackhat')) {
    aliases.add('black hat');
    aliases.add('blackhat');
  }
  const stripped = name
    .replace(/\b(20\d{2}|conference|europe|usa|us|global|summit|event)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length >= 3) aliases.add(stripped);
  return Array.from(aliases).sort((a, b) => b.length - a.length);
};
const findEventSpecificAskHits = (inputValue, sequence) => {
  const aliases = eventAliases(inputValue, sequence).map(escapeRegex).join('|');
  const hits = [];
  const patterns = [
    new RegExp(
      `\\b(?:worth|open\\s+to)\\b[^?]{0,120}\\b(?:coffee|meet(?:ing)?|chat|conversation|walkthrough|walk\\s+through)\\b[^?]{0,120}\\b(?:at|during)\\s+(?:the\\s+)?(?:${aliases})\\b[^?]*\\?`,
      'i',
    ),
    new RegExp(
      `\\b(?:worth|open\\s+to)\\b[^?]{0,120}\\b(?:at|during)\\s+(?:the\\s+)?(?:${aliases})\\b[^?]{0,120}\\b(?:coffee|meet(?:ing)?|chat|conversation|walkthrough|walk\\s+through)\\b[^?]*\\?`,
      'i',
    ),
  ];
  for (const touch of sequence.touches || []) {
    if (!touch || typeof touch !== 'object' || Array.isArray(touch)) continue;
    const body = touch.body || '';
    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match?.[0]) hits.push({ touchSlot: touch.touch_slot, value: match[0] });
    }
  }
  return hits;
};
const validateCadence = (inputValue, personaId, sequence, touches) => {
  const cadenceErrors = [];
  const cadenceChecks = {
    eventStartDate: null,
    eventEndDate: null,
    minOffsetDays: null,
    maxOffsetDays: null,
    expectedLeadTimeWeeks: null,
    leadTimeWeeks: sequence.leadTimeWeeks ?? null,
  };
  const startDate = eventStartDateFor(inputValue, sequence);
  const endDate = startDate ? eventEndDateFor(inputValue, sequence, startDate) : null;
  cadenceChecks.eventStartDate = startDate?.toISOString().slice(0, 10) || null;
  cadenceChecks.eventEndDate = endDate?.toISOString().slice(0, 10) || null;

  const offsets = [];
  for (let index = 0; index < touches.length; index++) {
    const touch = touches[index];
    if (!touch || typeof touch !== 'object' || Array.isArray(touch)) {
      errors.push({
        rule: 'touchShape',
        personaId,
        touchSlot: index + 1,
        offendingValue: JSON.stringify(touch),
        message: 'Every touch must be an object.',
      });
      continue;
    }
    const slot = touch.touch_slot ?? index + 1;
    const touchType = canonicalTouchType(touch.touch_type);
    const sendDate = parseDateOnly(touch.send_date || touch.sendDate);

    const offsetDays =
      typeof touch.offset_days === 'number'
        ? touch.offset_days
        : typeof touch.send_at_offset_days === 'number'
          ? touch.send_at_offset_days
          : null;
    if (typeof offsetDays === 'number') offsets.push(offsetDays);
    if (!startDate || !sendDate) continue;

    const derivedOffset = dayDiff(sendDate, startDate);
    if (typeof offsetDays === 'number' && derivedOffset !== offsetDays) {
      cadenceErrors.push({
        rule: 'offsetDateMismatch',
        personaId,
        touchSlot: slot,
        offendingValue: `${touch.send_date || touch.sendDate} vs ${offsetDays}`,
        message:
          'send_date does not match offset_days relative to the event start date.',
      });
    }

    const inEventWindow = sendDate >= startDate && sendDate <= endDate;
    if (touchType === 'cold_email_first_touch' && sendDate >= startDate) {
      cadenceErrors.push({
        rule: 'coldFirstTouchAfterEventStart',
        personaId,
        touchSlot: slot,
        offendingValue: touch.send_date || touch.sendDate,
        message: 'cold_email_first_touch must be sent before the event starts.',
      });
    }
    if (touchType === 'cold_email_followup_2' && inEventWindow) {
      cadenceErrors.push({
        rule: 'coldFollowupDuringEvent',
        personaId,
        touchSlot: slot,
        offendingValue: `${touchType} on ${touch.send_date || touch.sendDate}`,
        message:
          'cold_email_followup_2 should not be scheduled during the event window. Use the day-of nudge slot or post_event_followup when the timing changes.',
      });
    }
    if (touchType === 'post_event_followup' && sendDate <= endDate) {
      cadenceErrors.push({
        rule: 'postEventBeforeEventEnd',
        personaId,
        touchSlot: slot,
        offendingValue: touch.send_date || touch.sendDate,
        message: 'post_event_followup must be sent after the event ends.',
      });
    }
  }

  if (offsets.length > 0) {
    cadenceChecks.minOffsetDays = Math.min(...offsets);
    cadenceChecks.maxOffsetDays = Math.max(...offsets);
    const deepestPreEventOffset = Math.min(...offsets.filter((offset) => offset < 0));
    if (Number.isFinite(deepestPreEventOffset)) {
      const expectedLeadTimeWeeks = Math.max(
        1,
        Math.ceil(Math.abs(deepestPreEventOffset) / 7),
      );
      cadenceChecks.expectedLeadTimeWeeks = expectedLeadTimeWeeks;
      if (
        typeof sequence.leadTimeWeeks === 'number' &&
        sequence.leadTimeWeeks !== expectedLeadTimeWeeks
      ) {
        cadenceErrors.push({
          rule: 'leadTimeWeeksMismatch',
          personaId,
          offendingValue: `${sequence.leadTimeWeeks} vs ${expectedLeadTimeWeeks}`,
          message:
            'leadTimeWeeks must reflect the actual earliest pre-event send date in the generated cadence.',
        });
      }
    }
  }

  return { errors: cadenceErrors, checks: cadenceChecks };
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
    eventSpecificAskHits: [],
    cadence: {},
  };

  const cadence = validateCadence(input, personaId, sequence, touches);
  errors.push(...cadence.errors);
  checks.sequences[personaId].cadence = cadence.checks;

  for (let index = 0; index < touches.length; index++) {
    const touch = touches[index];
    if (!touch || typeof touch !== 'object' || Array.isArray(touch)) {
      errors.push({
        rule: 'touchShape',
        personaId,
        touchSlot: index + 1,
        offendingValue: JSON.stringify(touch),
        message: 'Every touch must be an object.',
      });
      continue;
    }
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
      const painAnchorHits = repeatedPainAnchorHits(previous.angle, touch.body || '');
      if (painAnchorHits.length > 0) {
        errors.push({
          rule: 'painAnchorReused',
          personaId,
          touchSlot: slot,
          offendingValue: painAnchorHits.slice(0, 4).join(', '),
          message:
            'Touch body reuses a concrete pain-anchor phrase from an earlier touch. Pick a different problem, consequence, or illumination route.',
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

  const eventSpecificAskRequired =
    input.eventSpecificAskRequired === true ||
    input.summary?.eventSpecificAskRequired === true ||
    sequence.eventSpecificAskRequired === true;
  const eventSpecificAskHits = findEventSpecificAskHits(input, sequence);
  checks.sequences[personaId].eventSpecificAskHits = eventSpecificAskHits;
  if (eventSpecificAskRequired && eventSpecificAskHits.length === 0) {
    errors.push({
      rule: 'eventSpecificAskMissing',
      personaId,
      message:
        'Sequence is marked eventSpecificAskRequired but has no natural event-specific ask such as "Worth coffee at {{event_name}} if this is already on your list?".',
    });
  }
}

process.stdout.write(
  JSON.stringify({ isValid: errors.length === 0, errors, checks }, null, 2) + '\n',
);
