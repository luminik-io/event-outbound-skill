#!/usr/bin/env node
// Validator CLI for a single outreach touch.
//
// Used by SKILL.md so Claude can validate a draft without a TS toolchain.
// Reads a JSON document describing the touch + the persona context, runs the
// same validation rules used by src/agents/sequencer.ts, and writes a JSON
// result to stdout.
//
// Usage:
//   node scripts/validate-touch.mjs --touch path/to/touch.json
//   echo '{...}' | node scripts/validate-touch.mjs --stdin
//
// Input shape:
//   {
//     "subject": "string",            // empty for LinkedIn touches
//     "body": "string",
//     "channel": "email" | "linkedin",
//     "touch_type": "cold_email_first_touch" | "cold_email_followup_2" | ...,
//     "eventName": "Money20/20 USA 2026",
//     "personaPriorities": ["..."],   // 0-N strings
//     "personaPainPoints":  ["..."]   // 0-N strings
//   }
//
// Output shape (always exit 0; errors are part of the contract):
//   {
//     "isValid": true | false,
//     "errors":  [{ "rule": "...", "message": "...", "offendingValue": "..." }],
//     "checks":  { ...counters and booleans... }
//   }

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DATA_DIR = join(REPO_ROOT, 'data');

// --- Argument parsing -------------------------------------------------------

const argv = process.argv.slice(2);
let touchPath = null;
let useStdin = false;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--touch' && argv[i + 1]) {
    touchPath = argv[++i];
  } else if (a === '--stdin') {
    useStdin = true;
  } else if (a === '-h' || a === '--help') {
    process.stdout.write(
      'Usage: validate-touch.mjs (--touch <file> | --stdin)\n' +
        'See script header for the input/output JSON shapes.\n',
    );
    process.exit(0);
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
}

let raw;
if (touchPath) {
  raw = readFileSync(touchPath, 'utf-8');
} else if (useStdin) {
  raw = await readStdin();
} else {
  process.stderr.write(
    'validate-touch: pass --touch <file> or --stdin with a JSON payload.\n',
  );
  process.exit(2);
}

let touch;
try {
  touch = JSON.parse(raw);
} catch (err) {
  process.stderr.write(`validate-touch: input is not valid JSON: ${err.message}\n`);
  process.exit(2);
}

// --- Load rules -------------------------------------------------------------

const benchmarks = JSON.parse(
  readFileSync(join(DATA_DIR, 'cold-email-benchmarks.json'), 'utf-8'),
);
const rules = JSON.parse(
  readFileSync(join(DATA_DIR, 'cold-outbound-rules.json'), 'utf-8'),
);
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

// --- Helpers ---------------------------------------------------------------

const lower = (s) => String(s || '').toLowerCase();
const countWords = (s) =>
  String(s || '')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
const countSentences = (s) => {
  const m = String(s || '').match(/[.!?]+/g);
  return m ? m.length : 0;
};
const findHits = (text, list) => {
  const hay = lower(text);
  return list.filter((p) => p && hay.includes(lower(p)));
};
const youVsWe = (s) => {
  const y = (lower(s).match(/\b(you|your)\b/g) || []).length;
  const w = (lower(s).match(/\b(we|our)\b/g) || []).length;
  return { you: y, we: w };
};

// --- Validate --------------------------------------------------------------

const errors = [];
const subject = touch.subject || '';
const body = touch.body || '';
const channel = touch.channel;
const touchType = touch.touch_type;
const isLinkedIn = channel === 'linkedin';
const combined = `${subject} ${body}`;

if (!channel || (channel !== 'email' && channel !== 'linkedin')) {
  errors.push({ rule: 'channel', message: `channel must be "email" or "linkedin" (got: ${channel})` });
}
if (!touchType) {
  errors.push({ rule: 'touch_type', message: 'touch_type is required' });
}

// Subject
const subjectWords = countWords(subject);
if (!isLinkedIn) {
  if (subjectWords === 0) {
    errors.push({ rule: 'emptySubject', message: 'Email subject is empty.' });
  } else if (subjectWords > benchmarks.subject_line_rules.max_word_count) {
    errors.push({
      rule: 'subjectWordCount',
      message: `Subject has ${subjectWords} words; max ${benchmarks.subject_line_rules.max_word_count}.`,
    });
  }
  if (
    benchmarks.subject_line_rules.all_lowercase &&
    subject !== subject.toLowerCase()
  ) {
    errors.push({ rule: 'allLowercase', message: 'Subject must be all lowercase.' });
  }
  const subjectBuzzHits = findHits(
    subject,
    benchmarks.subject_line_rules.buzzwords_banned || [],
  );
  if (subjectBuzzHits.length > 0) {
    errors.push({
      rule: 'subjectBuzzwords',
      message: `Subject contains banned buzzwords: ${subjectBuzzHits.join(', ')}.`,
      offendingValue: subjectBuzzHits.join(', '),
    });
  }
}

// Body length
const lenRule = (rules.channel_length_rules || {})[touchType];
const bodyWords = countWords(body);
const bodySentences = countSentences(body);
const bodyChars = body.length;

if (lenRule) {
  if (lenRule.min_words !== undefined && bodyWords < lenRule.min_words) {
    errors.push({
      rule: 'bodyWordCount',
      message: `Body has ${bodyWords} words; expected min ${lenRule.min_words} for ${touchType}.`,
    });
  }
  if (lenRule.max_words !== undefined && bodyWords > lenRule.max_words) {
    errors.push({
      rule: 'bodyWordCount',
      message: `Body has ${bodyWords} words; expected max ${lenRule.max_words} for ${touchType}.`,
    });
  }
  if (lenRule.min_sent !== undefined && bodySentences < lenRule.min_sent) {
    errors.push({
      rule: 'bodySentenceCount',
      message: `Body has ${bodySentences} sentences; expected min ${lenRule.min_sent} for ${touchType}.`,
    });
  }
  if (lenRule.max_sent !== undefined && bodySentences > lenRule.max_sent) {
    errors.push({
      rule: 'bodySentenceCount',
      message: `Body has ${bodySentences} sentences; expected max ${lenRule.max_sent} for ${touchType}.`,
    });
  }
  if (lenRule.max_chars !== undefined && bodyChars > lenRule.max_chars) {
    errors.push({
      rule: 'bodyCharCount',
      message: `Body has ${bodyChars} chars; expected max ${lenRule.max_chars} for ${touchType}.`,
    });
  }
}

// Banned phrases (CEB + canon merged)
const allBanned = [
  ...(benchmarks.banned_words_and_phrases || []),
  ...(rules.additional_banned_phrases || []),
];
const banHits = findHits(combined, allBanned);
if (banHits.length > 0) {
  errors.push({
    rule: 'bannedWords',
    message: `Banned phrases present: ${banHits.join(', ')}.`,
    offendingValue: banHits.join(', '),
  });
}

// LLM-cliche blocklist
const hardBans = {};
for (const cat of HARD_BAN_CATEGORIES) {
  const phrases = blocklist[cat];
  if (!phrases || !Array.isArray(phrases)) continue;
  const hits = findHits(combined, phrases);
  if (hits.length > 0) {
    hardBans[cat] = hits;
    errors.push({
      rule: `llmCliche:${cat}`,
      message: `LLM-cliche (${cat}) phrases present: ${hits.join(', ')}.`,
      offendingValue: hits.join(', '),
    });
  }
}
const softHits = (() => {
  const phrases = blocklist.hedge_softener_warnings;
  if (!phrases || !Array.isArray(phrases)) return [];
  return findHits(combined, phrases);
})();

// Pronoun ratio
const pronoun = youVsWe(body);
if (benchmarks.pronoun_ratio?.majority_you_your) {
  const ratio = pronoun.we === 0 ? (pronoun.you > 0 ? Infinity : 0) : pronoun.you / pronoun.we;
  if (ratio < 1) {
    errors.push({
      rule: 'pronounRatio',
      message: `you/we pronoun ratio is ${ratio.toFixed(2)} (you=${pronoun.you}, we=${pronoun.we}); expected majority you/your.`,
    });
  }
}

// Exclamation, emoji, em-dash
if (benchmarks.exclamation_marks_banned !== false && /[!]/.test(combined)) {
  errors.push({ rule: 'exclamationMark', message: 'No exclamation marks allowed.' });
}
if (benchmarks.emoji_banned !== false && /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F6FF}]/u.test(combined)) {
  errors.push({ rule: 'emoji', message: 'No emoji allowed.' });
}
if (/—/.test(combined)) {
  errors.push({
    rule: 'emDash',
    message: 'Em-dash (—) found. Replace with comma, period, colon, or parens.',
  });
}

// Leading-question pattern
const lqSpec = rules.leading_question_pattern;
if (lqSpec && lqSpec.fail) {
  const lqRegex = new RegExp(lqSpec.regex, lqSpec.flags || 'i');
  if (lqRegex.test(body)) {
    errors.push({
      rule: 'leadingQuestion',
      message:
        'Body contains a leading / moon-and-stars question pattern. Use a neutral how/what/why-are-you illumination question instead.',
    });
  }
}

// Illumination question
const iqSpec = rules.illumination_question_required;
let hasIQ = false;
if (iqSpec) {
  const baseFlags = (iqSpec.flags || 'i').replace('g', '');
  const iqRegex = new RegExp(iqSpec.regex, baseFlags + 'g');
  const iqMatches = lower(body).match(iqRegex) || [];
  hasIQ = iqMatches.length >= (iqSpec.min_count || 1);
  if (
    Array.isArray(iqSpec.applies_to) &&
    iqSpec.applies_to.includes(touchType) &&
    !hasIQ
  ) {
    errors.push({
      rule: 'illuminationQuestion',
      message: `${touchType} must contain at least ${iqSpec.min_count || 1} neutral how/what/why-are-you question.`,
    });
  }
}

// Specificity (event/persona/pain anchors)
const eventTokens = (touch.eventName || '')
  .toLowerCase()
  .split(/\s+/)
  .filter((t) => t.length > 3);
const priorityTokens = (touch.personaPriorities || [])
  .join(' ')
  .toLowerCase()
  .split(/\s+/)
  .filter((t) => t.length > 4);
const painTokens = (touch.personaPainPoints || [])
  .join(' ')
  .toLowerCase()
  .split(/\s+/)
  .filter((t) => t.length > 4);
const allTokens = [...eventTokens, ...priorityTokens, ...painTokens];
const combinedLower = lower(combined);
const specificityHits = allTokens.filter((t) => combinedLower.includes(t)).length;
if (allTokens.length > 0 && specificityHits === 0) {
  errors.push({
    rule: 'specificity',
    message: 'Touch lacks event-name / persona-priority / pain-point specificity.',
  });
}

// --- Output ----------------------------------------------------------------

const checks = {
  subjectWordCount: subjectWords,
  allLowercase: subject === subject.toLowerCase(),
  bodyWordCount: bodyWords,
  bodyCharCount: bodyChars,
  bodySentenceCount: bodySentences,
  bannedWordsFound: banHits,
  llmClicheHardBans: hardBans,
  llmClicheSoftWarnings: softHits,
  youVsWeRatio:
    pronoun.we === 0 ? (pronoun.you > 0 ? 99 : 0) : Number((pronoun.you / pronoun.we).toFixed(2)),
  hasIlluminationQuestion: hasIQ,
  hasEmDash: /—/.test(combined),
  hasExclamation: /[!]/.test(combined),
  specificityHits,
};

process.stdout.write(
  JSON.stringify(
    { isValid: errors.length === 0, errors, checks },
    null,
    2,
  ) + '\n',
);
