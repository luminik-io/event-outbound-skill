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
//     "eventLocation": "Las Vegas",  // optional; catches CTAs that bolt on the city
//     "personaPriorities": ["..."],   // 0-N strings
//     "personaPainPoints":  ["..."]   // 0-N strings
//     "strictTruth": true,             // optional; rejects invented assets/proof
//     "availableAssets": ["..."],      // optional; real assets sender can attach/link
//     "proofPoints": ["..."]           // optional; real customer/public proof
//     "strictAngleDiversity": true,     // optional; rejects recycled sequence angles
//     "painAngle": { "label": "...", "sourcePain": "...", ... },
//     "usedPainAngles": [{ "label": "..." }] // prior touches across all channels
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

// --- Helpers ---------------------------------------------------------------

const lower = (s) => String(s || '').toLowerCase();
const countWords = (s) =>
  String(s || '')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
const previewTokens = (text, maxWords) =>
  String(text || '')
    .toLowerCase()
    .match(/\{\{[a-z0-9_]+\}\}|[a-z0-9]+(?:[/-][a-z0-9]+)*(?:'[a-z]+)?/g)
    ?.slice(0, maxWords) || [];
const normalizePreviewToken = (token) =>
  token
    .replace(/^i(?:'m|'d|'ll|'ve)?$/, 'i')
    .replace(/^we(?:'re|'d|'ll|'ve)?$/, 'we');
const countSentences = (s) => {
  // Match a sentence terminator [.!?] only when it is NOT inside a number
  // (e.g. "1.4%" should not count as two sentences). The negative lookahead
  // skips `.` immediately followed by a digit. Multiple terminators in a row
  // ("?!") count as one. Leading/trailing whitespace handled by the caller.
  const m = String(s || '').match(/[.!?]+(?!\d)/g);
  return m ? m.length : 0;
};
const findHits = (text, list) => {
  const hay = lower(text);
  return list.filter((p) => p && hay.includes(lower(p)));
};
const patternHits = (text, patterns) => {
  const found = new Set();
  for (const pattern of patterns) {
    const match = String(text || '').match(pattern.regex);
    if (match?.[0]) found.add(match[0]);
  }
  return Array.from(found);
};
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const eventAliases = (eventName) => {
  const name = lower(eventName);
  const aliases = new Set();
  if (name.includes('rsa')) {
    aliases.add('rsa');
    aliases.add('rsa conference');
  }
  if (name.includes('money20/20') || name.includes('money2020')) {
    aliases.add('money20/20');
    aliases.add('money2020');
    aliases.add('m20/20');
    aliases.add('m2020');
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
  if (aliases.size === 0) {
    aliases.add('rsa');
    aliases.add('money20/20');
    aliases.add('money2020');
    aliases.add('m20/20');
    aliases.add('m2020');
  }
  return Array.from(aliases).sort((a, b) => b.length - a.length);
};
const locationAliases = (eventLocation) => {
  const name = lower(eventLocation);
  const aliases = new Set();
  const knownCities = [
    'amsterdam',
    'las vegas',
    'new york',
    'san francisco',
    'london',
    'paris',
    'berlin',
    'singapore',
    'barcelona',
    'miami',
    'boston',
    'chicago',
    'austin',
    'seattle',
    'orlando',
    'toronto',
    'dubai',
    'oslo',
  ];
  const cleaned = name
    .replace(/[()[\]]/g, ' ')
    .replace(/\b(online|virtual|hybrid|conference|venue|center|centre|hall)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];
  for (const city of knownCities) {
    if (cleaned.includes(city)) aliases.add(city);
  }
  for (const segment of cleaned.split(/[,|/]+/)) {
    const stripped = segment
      .replace(
        /\b(netherlands|united states|usa|us|uk|united kingdom|germany|france|spain|italy|canada|norway|ca|ny|tx|nv|il|ma|dc)\b/g,
        ' ',
      )
      .replace(/\s+/g, ' ')
      .trim();
    if (stripped.length >= 3) aliases.add(stripped);
  }
  return Array.from(aliases).sort((a, b) => b.length - a.length);
};
const findPermissionToSendPhrasing = (text) =>
  patternHits(text, [
    {
      regex: /\b(?:should|can|may)\s+i\s+(?:send|share|forward|drop|pass|show|walk)\b/i,
    },
    {
      regex: /\b(?:want|need)\s+(?:me|us)\s+to\s+(?:send|share|forward|drop|pass|show|walk)\b/i,
    },
    {
      regex: /\bhappy to\s+(?:send|share|chat|connect|jump|hop|forward|drop|walk)\b/i,
    },
    {
      regex: /\b(?:want|need)\s+the\s+(?:one[-\s]?pager|one[-\s]?page|write[-\s]?up|map|checklist|worksheet|recap|diagram|note|sheet)\b/i,
    },
    {
      regex: /\breply\s+(?:yes|y)\b[^.!?]*(?:send|share|forward|drop)\b/i,
    },
    {
      regex: /\bsay so\b[^.!?]*(?:send|share|forward|drop|come back)\b/i,
    },
    {
      regex: /\b(?:free for|worth)\s+(?:ten|fifteen|twenty|thirty|\d+)\s+minutes?\b/i,
    },
  ]);
const LINKEDIN_CONNECTION_CTA_PATTERNS = [
  { regex: /\bopen\s+to\s+connect(?:ing)?(?:\s+here)?\?/i },
  { regex: /\bworth\s+connect(?:ing)?(?:\s+here)?\?/i },
];
const LEAN_BACK_CTA_PATTERNS = [
  {
    regex:
      /\bworth\s+(?:a\s+)?(?:look|closer\s+look|peek|skim|read|conversation|exchange|coffee|seat|review|look\s+into|looking\s+into|taking\s+a\s+look|checking)\b[^.!?]{0,80}\?/i,
  },
  {
    regex:
      /\bopen\s+to\s+(?:taking\s+a\s+look|looking\s+into|learning\s+more|connect(?:ing)?|checking|reviewing)\b[^.!?]{0,80}\?/i,
  },
  { regex: /\bdoes\s+this\s+belong\b[^?]{0,100}\?/i },
  { regex: /\bis\s+this\s+(?:on|a|worth)\b[^?]{0,100}\?/i },
  { regex: /\bwhat\s+do\s+you\s+think\?/i },
  {
    regex:
      /\bor\s+(?:parked|tabled|table\s+for\s+now|ignore|not\s+worth\s+it|too\s+early|later)\b[^?]{0,80}\?/i,
  },
];
const CLEAR_CTA_TOUCH_TYPES = new Set([
  'cold_email_first_touch',
  'cold_email_followup_2',
  'cold_email_followup_3plus',
  'email_cold',
  'linkedin_connection_request',
  'linkedin_dm_post_connect',
  'linkedin_day_of_nudge',
  'post_event_followup',
]);
const COMMA_SPLICED_CTA_PATTERNS = [
  {
    regex:
      /\b(?:i\s+)?attached\b[^.!?]{0,160},\s*(?:worth|open\s+to|does\s+this\s+belong|is\s+this\s+on|what\s+do\s+you\s+think)\b[^?]{0,100}\?/i,
  },
];
const requiresClearCta = (candidateTouchType, candidateChannel) =>
  candidateChannel === 'linkedin' ||
  canonicalTouchType(candidateTouchType).startsWith('linkedin_') ||
  CLEAR_CTA_TOUCH_TYPES.has(canonicalTouchType(candidateTouchType));
const findClearCtaPhrasing = (
  text,
  candidateTouchType,
  candidateChannel,
  approvedPhrases = [],
) => {
  if (!requiresClearCta(candidateTouchType, candidateChannel)) return [];
  const ruleKey = canonicalTouchType(candidateTouchType);
  if (ruleKey === 'linkedin_connection_request') {
    return patternHits(text, LINKEDIN_CONNECTION_CTA_PATTERNS);
  }
  const tail = String(text || '').slice(-240);
  const hits = new Set(patternHits(tail, LEAN_BACK_CTA_PATTERNS));
  for (const phrase of approvedPhrases) {
    if (!phrase) continue;
    const phraseCta = new RegExp(`${escapeRegex(phrase)}[^.!?]{0,80}\\?`, 'i');
    if (phraseCta.test(tail)) hits.add(phrase);
  }
  return Array.from(hits);
};
const findCommaSplicedCtaPhrasing = (text) =>
  patternHits(text, COMMA_SPLICED_CTA_PATTERNS);
const findTemplateGreeting = (text) =>
  patternHits(text, [
    { regex: /^\s*(?:hi|hey|hello)\s+\{\{first_name\}\}\s*,/i },
  ]);
const findSignatureBlock = (text) => {
  const trimmedText = String(text || '').trimEnd();
  const match = trimmedText.match(
    /\n\s*\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}(?:\s*,\s*(?:founder|ceo|vp|head|director|partner|partnerships|sales|marketing|solutions).*)?)\s*$/i,
  );
  return match?.[1] ? [match[1]] : [];
};
const findAwkwardCoordinatedClause = (text) =>
  patternHits(text, [
    {
      regex:
        /,\s+and\s+(?:talking|comparing|working|looking|thinking|meeting|checking|reviewing|walking)\b[^.!?]{0,120}/i,
    },
  ]);
const findMissingMergeFields = (text, requiredFields = ['{{first_name}}', '{{company}}']) => {
  const hay = lower(text);
  return requiredFields.filter((field) => !hay.includes(lower(field)));
};
const findAssetPromisePhrasing = (text) =>
  patternHits(text, [
    {
      regex: /\b(?:attached|linked|enclosed|included)\b[^.!?]{0,80}\b(?:1[-\s]?pager|one[-\s]?pager|one[-\s]?page|worksheet|checklist|matrix|brief|recap|report|audit|doc|write[-\s]?up|map|notes?)\b/i,
    },
    {
      regex: /\b(?:1[-\s]?pager|one[-\s]?pager|one[-\s]?page|worksheet|checklist|matrix|brief|recap|report|audit|doc|write[-\s]?up|map|notes?)\b[^.!?]{0,50}\b(?:attached|linked|enclosed|included)\b/i,
    },
    {
      regex: /\b(?:i\s+)?(?:put together|wrote up|pulled together|built|made)\b[^.!?]{0,100}\b(?:1[-\s]?pager|one[-\s]?pager|one[-\s]?page|worksheet|checklist|matrix|brief|recap|report|audit|doc|write[-\s]?up|map|notes?)\b/i,
    },
    {
      regex: /\b(?:here(?:'s| is)|below is|below are)\b[^.!?]{0,80}\b(?:1[-\s]?pager|one[-\s]?pager|one[-\s]?page|worksheet|checklist|matrix|brief|recap|report|audit|doc|write[-\s]?up|map|notes?)\b/i,
    },
  ]);
const findProofClaimPhrasing = (text) =>
  patternHits(text, [
    {
      regex: /\b(?:using|used by|worked with|helped|seen|customer|customers|client|clients)\b[^.!?]{0,120}\b(?:compared to|instead of|cut|reduced|lifted|increased|saved|caught|shipped|booked|hit|kept|killed)\b/i,
    },
    {
      regex: /\b(?:two|three|four|five|\d+)\s+(?:payments?|fintech|security|cybersecurity|saas|identity|compliance|risk|fraud)?\s*(?:orgs?|teams?|companies|customers|clients|leaders|operators)\b[^.!?]{0,120}\b(?:compared to|instead of|cut|reduced|lifted|increased|saved|caught|shipped|booked|hit|kept|killed)\b/i,
    },
    {
      regex: /\b(?:from\s+\d+(?:\.\d+)?%?\s+to\s+\d+(?:\.\d+)?%?|compared to\s+\d+(?:\.\d+)?%?\s+before|\d+(?:\.\d+)?%?\s+instead of\s+\d+(?:\.\d+)?%?)\b/i,
    },
  ]);
const findForcedEventPhrasing = (text, eventName, eventLocation) => {
  const aliases = eventAliases(eventName).map(escapeRegex).join('|');
  const patterns = [
    {
      regex: new RegExp(
        `\\b(?:keeps?\\s+coming\\s+up|comes\\s+up|keep\\s+hearing|hearing)\\b[^.!?]{0,100}\\b(?:before|into)\\s+(?:${aliases})\\b`,
        'i',
      ),
    },
    { regex: new RegExp(`\\bweek\\s+of\\s+(?:${aliases})\\b`, 'i') },
    {
      regex: new RegExp(
        `\\b(?:week\\s+one|two\\s+weeks?)\\s+post[-\\s](?:${aliases})\\b`,
        'i',
      ),
    },
    { regex: new RegExp(`\\btoday\\s+at\\s+(?:${aliases})\\b`, 'i') },
    {
      regex: new RegExp(
        `\\bhow\\s+(?:are|do|is|can|could|would|should|did)\\s+(?:you|your)\\b[^?]{0,140}\\bbefore\\s+(?:${aliases})\\?`,
        'i',
      ),
    },
    {
      regex: new RegExp(
        `\\b(?:is\\s+this\\s+)?(?:worth|useful|open\\s+to|does\\s+this\\s+belong)\\b[^?]{0,120}\\b(?:before|for|around|into)\\s+(?:the\\s+)?(?:${aliases})(?:\\s+(?:prep|planning|review|readout|trip))?\\?`,
        'i',
      ),
    },
    { regex: /\bm(?:20\/20|2020)\b/i },
  ];
  const locations = locationAliases(eventLocation).map(escapeRegex).join('|');
  if (locations) {
    patterns.push({
      regex: new RegExp(
        `\\b(?:is\\s+this\\s+)?(?:worth|useful|open\\s+to|does\\s+this\\s+belong)\\b[^?]{0,120}\\b(?:before|for|around|into|in)\\s+(?:the\\s+)?(?:${locations})(?:\\s+(?:prep|planning|review|readout|trip))?\\?`,
        'i',
      ),
    });
  }
  return patternHits(text, patterns);
};
const findSellerFirstPreviewPhrasing = (
  text,
  wordWindow = 18,
  bannedPronouns = ['i', 'me', 'my', 'we', 'us', 'our', 'ours'],
) => {
  const banned = new Set(bannedPronouns.map((p) => lower(p)));
  const found = new Set();
  for (const token of previewTokens(text, wordWindow).map(normalizePreviewToken)) {
    if (banned.has(token)) found.add(token);
  }
  return Array.from(found);
};
const findEventFirstPreviewPhrasing = (text, eventName, wordWindow = 12) => {
  const tokens = previewTokens(text, wordWindow);
  const preview = tokens
    .filter((t) => !/^\{\{[a-z0-9_]+\}\}$/.test(t))
    .join(' ')
    .trim();
  const found = new Set();
  for (const alias of eventAliases(eventName).map(escapeRegex)) {
    const direct = new RegExp(`^(?:the\\s+)?${alias}\\b`, 'i');
    const prep = new RegExp(
      `^(?:at|before|ahead\\s+of|going\\s+into|during|after|today\\s+at|week\\s+of|the\\s+week\\s+of)\\s+(?:the\\s+)?${alias}\\b`,
      'i',
    );
    const match = preview.match(prep) || preview.match(direct);
    if (match?.[0]) found.add(match[0]);
  }
  return Array.from(found);
};
const youVsWe = (s) => {
  const y = (lower(s).match(/\b(you|your)\b/g) || []).length;
  const w = (lower(s).match(/\b(we|our)\b/g) || []).length;
  return { you: y, we: w };
};
const PAIN_STOPWORDS = new Set([
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
const painAngleText = (angle) => {
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
const painAngleLabel = (angle) => {
  if (!angle) return '';
  if (typeof angle === 'string') return angle;
  return angle.label || angle.sourcePain || angle.source_pain || '';
};
const painAngleTokens = (text) => {
  const tokens =
    lower(text)
      .replace(/\{\{[a-z0-9_]+\}\}/g, ' ')
      .match(/[a-z0-9]+(?:[-/][a-z0-9]+)*/g) || [];
  return Array.from(
    new Set(
      tokens
        .map((token) =>
          token
            .replace(/(?:ing|tion|sion|ment|ness|ities|ity|ed|es|s)$/i, '')
            .replace(/[-/]/g, ''),
        )
        .filter((token) => token.length >= 4 && !PAIN_STOPWORDS.has(token)),
    ),
  );
};
const painSimilarity = (a, b) => {
  const left = new Set(painAngleTokens(a));
  const right = new Set(painAngleTokens(b));
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) intersection++;
  }
  return intersection / new Set([...left, ...right]).size;
};
const normalizedPainLabel = (angle) => painAngleTokens(painAngleLabel(angle)).join(' ');
const findReusedPainAngles = (current, previousAngles = [], bodyText = '') => {
  const hits = new Set();
  const currentLabel = normalizedPainLabel(current);
  const currentText = painAngleText(current);
  let bodyOverlap = 0;
  const bodyTokenSet = new Set(painAngleTokens(bodyText));
  for (const previous of previousAngles) {
    const previousLabel = normalizedPainLabel(previous);
    const previousText = painAngleText(previous);
    if (!previousText.trim()) continue;
    const previousTokens = painAngleTokens(previousText);
    const sharedWithBody = previousTokens.filter((token) => bodyTokenSet.has(token));
    const overlap =
      previousTokens.length === 0 ? 0 : sharedWithBody.length / previousTokens.length;
    bodyOverlap = Math.max(bodyOverlap, overlap);
    if (
      (currentLabel && previousLabel && currentLabel === previousLabel) ||
      painSimilarity(currentText, previousText) >= 0.42 ||
      (sharedWithBody.length >= 2 && overlap >= 0.6)
    ) {
      hits.add(painAngleLabel(previous) || previousText);
    }
  }
  return { hits: Array.from(hits), bodyOverlap: Number(bodyOverlap.toFixed(2)) };
};
const painAngleMatchesBody = (angle, bodyText) => {
  const tokens = painAngleTokens(painAngleText(angle));
  if (tokens.length === 0) return false;
  const bodyTokenSet = new Set(painAngleTokens(bodyText));
  return tokens.some((token) => bodyTokenSet.has(token));
};

// --- Validate --------------------------------------------------------------

const errors = [];
const subject = touch.subject || '';
const body = touch.body || '';
const channel = touch.channel;
const touchType = touch.touch_type;
const ruleKey = canonicalTouchType(touchType);
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
if (isLinkedIn) {
  if (subject.trim().length > 0) {
    errors.push({
      rule: 'linkedinSubject',
      message: 'LinkedIn touches must not include a subject.',
      offendingValue: subject,
    });
  }
} else {
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
  if (benchmarks.subject_line_rules.numbers_banned && /\d/.test(subject)) {
    errors.push({
      rule: 'subjectNumbers',
      message: 'Subject must not contain digits.',
    });
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
const lenRule = (rules.channel_length_rules || {})[ruleKey];
const bodyWords = countWords(body);
const bodySentences = countSentences(body);
const bodyChars = body.length;

if (!ruleKey || !lenRule) {
  errors.push({
    rule: 'unknownTouchType',
    message: `Unknown touch_type '${touchType}'. Use a supported channel length rule key.`,
    offendingValue: touchType,
  });
} else {
  if (lenRule.min_words !== undefined && bodyWords < lenRule.min_words) {
    errors.push({
      rule: 'bodyWordCount',
      message: `Body has ${bodyWords} words; expected min ${lenRule.min_words} for ${ruleKey}.`,
    });
  }
  if (lenRule.max_words !== undefined && bodyWords > lenRule.max_words) {
    errors.push({
      rule: 'bodyWordCount',
      message: `Body has ${bodyWords} words; expected max ${lenRule.max_words} for ${ruleKey}.`,
    });
  }
  if (lenRule.min_sent !== undefined && bodySentences < lenRule.min_sent) {
    errors.push({
      rule: 'bodySentenceCount',
      message: `Body has ${bodySentences} sentences; expected min ${lenRule.min_sent} for ${ruleKey}.`,
    });
  }
  if (lenRule.max_sent !== undefined && bodySentences > lenRule.max_sent) {
    errors.push({
      rule: 'bodySentenceCount',
      message: `Body has ${bodySentences} sentences; expected max ${lenRule.max_sent} for ${ruleKey}.`,
    });
  }
  if (lenRule.max_chars !== undefined && bodyChars > lenRule.max_chars) {
    errors.push({
      rule: 'bodyCharCount',
      message: `Body has ${bodyChars} chars; expected max ${lenRule.max_chars} for ${ruleKey}.`,
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

const permissionToSendHits = findPermissionToSendPhrasing(combined);
if (permissionToSendHits.length > 0) {
  errors.push({
    rule: 'permissionToSendCta',
    message:
      'Body asks permission to send/share an asset or uses minutes as the CTA. Attach/link the useful thing and ask one real question instead.',
    offendingValue: permissionToSendHits.join(', '),
  });
}

const clearCtaHits = findClearCtaPhrasing(
  body,
  ruleKey,
  channel,
  rules.specific_pass_phrases?.lean_back_ctas,
);
const missingClearCta =
  requiresClearCta(ruleKey, channel) && clearCtaHits.length === 0;
if (missingClearCta) {
  errors.push({
    rule: 'clearCta',
    message:
      ruleKey === 'linkedin_connection_request'
        ? 'LinkedIn connection requests must close with an explicit connection ask such as "Open to connecting?" or "Worth connecting?".'
        : 'Every touch must close with a clear lean-back CTA question such as "Worth looking into?", "Open to taking a look?", or "Does this belong in the roadmap conversation?".',
  });
}

const commaSplicedCtaHits = findCommaSplicedCtaPhrasing(body);
if (commaSplicedCtaHits.length > 0) {
  errors.push({
    rule: 'commaSplicedCta',
    message:
      'Do not comma-splice an asset statement into the CTA. Use a clean CTA sentence or rewrite the final sentence around the question.',
    offendingValue: commaSplicedCtaHits.join(', '),
  });
}

const templateGreetingHits = findTemplateGreeting(body);
if (templateGreetingHits.length > 0) {
  errors.push({
    rule: 'templateGreeting',
    message:
      'Do not open with a generic greeting. Start directly with {{first_name}}, then the buyer-relevant trigger.',
    offendingValue: templateGreetingHits.join(', '),
  });
}

const signatureBlockHits = findSignatureBlock(body);
if (signatureBlockHits.length > 0) {
  errors.push({
    rule: 'signatureBlock',
    message:
      'Do not put sender signatures inside touch.body. Keep the body clean for sequencer import.',
    offendingValue: signatureBlockHits.join(', '),
  });
}

const awkwardCoordinatedClauseHits = findAwkwardCoordinatedClause(body);
if (awkwardCoordinatedClauseHits.length > 0) {
  errors.push({
    rule: 'awkwardCoordinatedClause',
    message:
      'Copy has an awkward comma-plus-gerund clause. Rewrite as a direct sentence with one clear action or observation.',
    offendingValue: awkwardCoordinatedClauseHits.join(', '),
  });
}

const forcedEventPhrasingHits = findForcedEventPhrasing(
  combined,
  touch.eventName,
  touch.eventLocation,
);
if (forcedEventPhrasingHits.length > 0) {
  errors.push({
    rule: 'forcedEventPhrasing',
    message:
      'Event reference feels forced. Use the buyer responsibility as the reason to write; use the event naturally only when it helps the ask.',
    offendingValue: forcedEventPhrasingHits.join(', '),
  });
}

const strictContext = touch.strictTruth === true;
const mergeSpec = rules.strict_context_rules?.apollo_merge_fields;
const mergeApplies =
  touch.apolloMergeFieldsRequired === true ||
  (strictContext &&
    Array.isArray(mergeSpec?.applies_to) &&
    mergeSpec.applies_to.includes(ruleKey));
const requiredMergeFields = mergeSpec?.required_fields || ['{{first_name}}', '{{company}}'];
const missingMergeFields = mergeApplies
  ? findMissingMergeFields(body, requiredMergeFields)
  : [];
if (missingMergeFields.length > 0) {
  errors.push({
    rule: 'missingMergeFields',
    message: `Body must include Apollo-ready merge fields: ${missingMergeFields.join(', ')}.`,
    offendingValue: missingMergeFields.join(', '),
  });
}

const availableAssets = Array.isArray(touch.availableAssets)
  ? touch.availableAssets.filter(Boolean)
  : [];
const proofPoints = Array.isArray(touch.proofPoints)
  ? touch.proofPoints.filter(Boolean)
  : [];
const assetPromiseHits = findAssetPromisePhrasing(combined);
if (strictContext && assetPromiseHits.length > 0 && availableAssets.length === 0) {
  errors.push({
    rule: 'unsourcedAssetPromise',
    message:
      'Body promises or references an asset, but no availableAssets were supplied. Do not invent matrices, briefs, worksheets, or reports.',
    offendingValue: assetPromiseHits.join(', '),
  });
}

const proofClaimHits = findProofClaimPhrasing(combined);
if (strictContext && proofClaimHits.length > 0 && proofPoints.length === 0) {
  errors.push({
    rule: 'unsourcedProofClaim',
    message:
      'Body makes a customer, peer, or before/after proof claim, but no proofPoints were supplied. Ask for proof or write without fabricated validation.',
    offendingValue: proofClaimHits.join(', '),
  });
}

const previewSpec = rules.preview_line_rules;
const previewApplies = Boolean(
  Array.isArray(previewSpec?.applies_to) && previewSpec.applies_to.includes(ruleKey),
);
const previewSellerHits = previewApplies
  ? findSellerFirstPreviewPhrasing(
      body,
      previewSpec?.word_window ?? 18,
      previewSpec?.seller_pronouns_banned,
    )
  : [];
if (previewSellerHits.length > 0) {
  errors.push({
    rule: 'previewLineSellerFirst',
    message:
      'First inbox-preview words are seller-first. Open with buyer responsibility, not I/we/us.',
    offendingValue: previewSellerHits.join(', '),
  });
}

const previewEventHits = previewApplies
  ? findEventFirstPreviewPhrasing(
      body,
      touch.eventName,
      previewSpec?.event_first_word_window ?? 12,
    )
  : [];
if (previewEventHits.length > 0) {
  errors.push({
    rule: 'previewLineEventFirst',
    message:
      'First inbox-preview words are event-first. Use the buyer responsibility as the opener and the event as supporting context.',
    offendingValue: previewEventHits.join(', '),
  });
}

const strictAngleDiversity = touch.strictAngleDiversity === true;
const currentPainAngle = touch.painAngle || touch.pain_angle;
const usedPainAngles = Array.isArray(touch.usedPainAngles || touch.used_pain_angles)
  ? touch.usedPainAngles || touch.used_pain_angles
  : [];
const reusedPainAngle = findReusedPainAngles(currentPainAngle, usedPainAngles, body);
const painAngleBodyMatches =
  !currentPainAngle || painAngleMatchesBody(currentPainAngle, body);
if (strictAngleDiversity && !currentPainAngle) {
  errors.push({
    rule: 'missingPainAngle',
    message: 'Strict angle diversity requires a painAngle label for every touch.',
  });
}
if (strictAngleDiversity && currentPainAngle && !painAngleBodyMatches) {
  errors.push({
    rule: 'painAngleMismatch',
    message:
      'Touch declares a pain angle, but the body does not visibly use that angle. Rewrite so the metadata and copy match.',
    offendingValue: painAngleLabel(currentPainAngle),
  });
}
if (strictAngleDiversity && reusedPainAngle.hits.length > 0) {
  errors.push({
    rule: 'painAngleReused',
    message:
      'Touch reuses a pain angle or angle vocabulary from an earlier sequence step. Pick a different buyer problem, consequence, or illumination route.',
    offendingValue: reusedPainAngle.hits.join(', '),
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

// Sentence-start capitalization in body. Bodies use proper grammar:
// the first letter of each sentence is uppercase. Subjects stay lowercase
// (per the canon's subject-line convention; not checked here).
const trimmed = body.trim();
if (trimmed.length > 0) {
  const firstChar = trimmed[0];
  // Allow merge fields ({{first_name}}) and quoted opens; otherwise require uppercase.
  if (/^[a-z]/.test(firstChar)) {
    errors.push({
      rule: 'sentenceCapitalization',
      message: `Body starts with a lowercase letter ("${firstChar}"). Bodies use proper grammar: capitalize the first letter of each sentence.`,
    });
  }
  // Each ". <letter>" must be ". <Letter>" or ". <merge-field>".
  const lowerStarts = trimmed.match(/[.!?]\s+[a-z]/g) || [];
  if (lowerStarts.length > 0) {
    errors.push({
      rule: 'sentenceCapitalization',
      message: `Body has ${lowerStarts.length} sentence(s) that start with a lowercase letter (after a period). Capitalize the first letter of every sentence.`,
      offendingValue: lowerStarts.join(' / '),
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
    iqSpec.applies_to.includes(ruleKey) &&
    !hasIQ
  ) {
    errors.push({
      rule: 'illuminationQuestion',
      message: `${ruleKey} must contain at least ${iqSpec.min_count || 1} neutral how/what/why-are-you question.`,
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
  canonicalTouchType: ruleKey,
  linkedinSubject: isLinkedIn ? subject : undefined,
  bannedWordsFound: banHits,
  llmClicheHardBans: hardBans,
  llmClicheSoftWarnings: softHits,
  youVsWeRatio:
    pronoun.we === 0 ? (pronoun.you > 0 ? 99 : 0) : Number((pronoun.you / pronoun.we).toFixed(2)),
  hasIlluminationQuestion: hasIQ,
  hasEmDash: /—/.test(combined),
  hasExclamation: /[!]/.test(combined),
  specificityHits,
  permissionToSendHits,
  forcedEventPhrasingHits,
  missingMergeFields,
  assetPromiseHits,
  proofClaimHits,
  previewSellerHits,
  previewEventHits,
  clearCtaHits,
  missingClearCta,
  commaSplicedCtaHits,
  templateGreetingHits,
  signatureBlockHits,
  awkwardCoordinatedClauseHits,
  painAngleLabel: currentPainAngle ? painAngleLabel(currentPainAngle) : undefined,
  reusedPainAngleHits: reusedPainAngle.hits,
  painAngleBodyOverlap: reusedPainAngle.bodyOverlap,
};

process.stdout.write(
  JSON.stringify(
    { isValid: errors.length === 0, errors, checks },
    null,
    2,
  ) + '\n',
);
