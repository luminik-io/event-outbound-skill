import { readFileSync } from 'fs';
import * as path from 'path';

export type ColdEmailBenchmarks = {
  subject_line_rules: {
    max_word_count: number;
    all_lowercase: boolean;
    buzzwords_banned: string[];
    numbers_banned?: boolean;
    social_proof_banned?: boolean;
    empty_subjects_banned?: boolean;
  };
  email_body_targets: {
    min_word_count: number;
    max_word_count: number;
    min_sentence_count: number;
    max_sentence_count: number;
    structure?: string;
  };
  pronoun_ratio: {
    majority_you_your: boolean;
  };
  cta_type_ranking: Array<{ type: string; reply_rate_delta: number }>;
  banned_words_and_phrases: string[];
  exclamation_marks_banned: boolean;
  emoji_banned: boolean;
  personalization_tier_ranking?: string[];
};

export type ColdOutboundPatterns = string;
export type ColdOutboundFrameworks = string;

export type ChannelLengthRule = {
  min_words?: number;
  max_words?: number;
  min_sent?: number;
  max_sent?: number;
  max_chars?: number;
};

export type ColdOutboundRules = {
  channel_length_rules: { [touchType: string]: ChannelLengthRule };
  median_sentence_length_max: number;
  preview_line_rules?: {
    applies_to: string[];
    word_window: number;
    event_first_word_window?: number;
    seller_pronouns_banned?: string[];
  };
  additional_banned_phrases: string[];
  leading_question_pattern: { regex: string; flags?: string; fail: boolean };
  illumination_question_required: {
    applies_to: string[];
    regex: string;
    flags?: string;
    min_count: number;
  };
  specific_pass_phrases?: { lean_back_ctas?: string[] };
  llm_cliche_blocklist?: {
    performative_empathy?: string[];
    generic_compliments?: string[];
    sales_speak_openers?: string[];
    manufactured_intimacy?: string[];
    marketing_buzzwords?: string[];
    cold_email_overused?: string[];
    lazy_generalization_openers?: string[];
    llm_transition_tics?: string[];
    gpt_vocabulary?: string[];
    hedge_softener_warnings?: string[];
  };
};

export type LlmClicheCategory =
  | 'performative_empathy'
  | 'generic_compliments'
  | 'sales_speak_openers'
  | 'manufactured_intimacy'
  | 'marketing_buzzwords'
  | 'cold_email_overused'
  | 'lazy_generalization_openers'
  | 'llm_transition_tics'
  | 'gpt_vocabulary'
  | 'hedge_softener_warnings';

const HARD_BAN_CATEGORIES: LlmClicheCategory[] = [
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

const SOFT_WARNING_CATEGORIES: LlmClicheCategory[] = ['hedge_softener_warnings'];

/**
 * Scan text for LLM-cliche phrases. Returns a per-category map of phrases
 * that fired, separated into hard-ban (operator must rewrite) and soft-warning
 * (operator can review). Phrases match case-insensitively as substrings; the
 * caller is responsible for word-boundary tightening if needed.
 */
export function findLlmCliches(
  text: string,
  blocklist: NonNullable<ColdOutboundRules['llm_cliche_blocklist']> | undefined,
): {
  hardBans: { [K in LlmClicheCategory]?: string[] };
  softWarnings: { [K in LlmClicheCategory]?: string[] };
} {
  const out: {
    hardBans: { [K in LlmClicheCategory]?: string[] };
    softWarnings: { [K in LlmClicheCategory]?: string[] };
  } = { hardBans: {}, softWarnings: {} };
  if (!blocklist) return out;
  const lower = text.toLowerCase();
  for (const cat of HARD_BAN_CATEGORIES) {
    const phrases = blocklist[cat];
    if (!phrases) continue;
    const hits = phrases.filter((p) => lower.includes(p.toLowerCase()));
    if (hits.length > 0) out.hardBans[cat] = hits;
  }
  for (const cat of SOFT_WARNING_CATEGORIES) {
    const phrases = blocklist[cat];
    if (!phrases) continue;
    const hits = phrases.filter((p) => lower.includes(p.toLowerCase()));
    if (hits.length > 0) out.softWarnings[cat] = hits;
  }
  return out;
}

type PhrasePattern = {
  regex: RegExp;
  label: string;
};

const PERMISSION_TO_SEND_PATTERNS: PhrasePattern[] = [
  {
    label: 'permission-to-send question',
    regex: /\b(?:should|can|may)\s+i\s+(?:send|share|forward|drop|pass|show|walk)\b/i,
  },
  {
    label: 'want-me-to-send question',
    regex: /\b(?:want|need)\s+(?:me|us)\s+to\s+(?:send|share|forward|drop|pass|show|walk)\b/i,
  },
  {
    label: 'happy-to-send phrase',
    regex: /\bhappy to\s+(?:send|share|chat|connect|jump|hop|forward|drop|walk)\b/i,
  },
  {
    label: 'gated asset question',
    regex: /\b(?:want|need)\s+the\s+(?:one[-\s]?pager|one[-\s]?page|write[-\s]?up|map|checklist|worksheet|recap|diagram|note|sheet)\b/i,
  },
  {
    label: 'reply-yes-to-send phrase',
    regex: /\breply\s+(?:yes|y)\b[^.!?]*(?:send|share|forward|drop)\b/i,
  },
  {
    label: 'say-so-to-send phrase',
    regex: /\bsay so\b[^.!?]*(?:send|share|forward|drop|come back)\b/i,
  },
  {
    label: 'minutes-as-cta phrase',
    regex: /\b(?:free for|worth)\s+(?:ten|fifteen|twenty|thirty|\d+)\s+minutes?\b/i,
  },
];

function patternHits(text: string, patterns: PhrasePattern[]): string[] {
  const found = new Set<string>();
  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match?.[0]) found.add(match[0]);
  }
  return Array.from(found);
}

function previewTokens(text: string, maxWords: number): string[] {
  const tokens =
    text
      .toLowerCase()
      .match(/\{\{[a-z0-9_]+\}\}|[a-z0-9]+(?:[/-][a-z0-9]+)*(?:'[a-z]+)?/g) ||
    [];
  return tokens.slice(0, maxWords);
}

function normalizePreviewToken(token: string): string {
  return token
    .replace(/^i(?:'m|'d|'ll|'ve)?$/, 'i')
    .replace(/^we(?:'re|'d|'ll|'ve)?$/, 'we');
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function eventAliases(eventName?: string): string[] {
  const lower = (eventName || '').toLowerCase();
  const aliases = new Set<string>();
  if (lower.includes('rsa')) {
    aliases.add('rsa');
    aliases.add('rsa conference');
  }
  if (lower.includes('money20/20') || lower.includes('money2020')) {
    aliases.add('money20/20');
    aliases.add('money2020');
    aliases.add('m20/20');
    aliases.add('m2020');
  }
  if (lower.includes('black hat') || lower.includes('blackhat')) {
    aliases.add('black hat');
    aliases.add('blackhat');
  }
  const stripped = lower
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
}

/**
 * Catch asset-gating CTAs. Good copy attaches or links the useful thing and
 * asks a real question. It does not ask permission to send the thing.
 */
export function findPermissionToSendPhrasing(text: string): string[] {
  return patternHits(text, PERMISSION_TO_SEND_PATTERNS);
}

/**
 * Catch event references that read like a template variable was pushed into
 * the wrong sentence. Natural event asks such as "Worth coffee at RSA?" pass.
 */
export function findForcedEventPhrasing(text: string, eventName?: string): string[] {
  const aliases = eventAliases(eventName).map(escapeRegex).join('|');
  const patterns: PhrasePattern[] = [
    {
      label: 'keeps-coming-up-before-event opener',
      regex: new RegExp(
        `\\b(?:keeps?\\s+coming\\s+up|comes\\s+up|keep\\s+hearing|hearing)\\b[^.!?]{0,100}\\b(?:before|into)\\s+(?:${aliases})\\b`,
        'i',
      ),
    },
    {
      label: 'week-of-event opener',
      regex: new RegExp(`\\bweek\\s+of\\s+(?:${aliases})\\b`, 'i'),
    },
    {
      label: 'post-event shorthand opener',
      regex: new RegExp(
        `\\b(?:week\\s+one|two\\s+weeks?)\\s+post[-\\s](?:${aliases})\\b`,
        'i',
      ),
    },
    {
      label: 'today-at-event opener',
      regex: new RegExp(`\\btoday\\s+at\\s+(?:${aliases})\\b`, 'i'),
    },
    {
      label: 'forced-before-event question',
      regex: new RegExp(
        `\\bhow\\s+(?:are|do|is|can|could|would|should|did)\\s+(?:you|your)\\b[^?]{0,140}\\bbefore\\s+(?:${aliases})\\?`,
        'i',
      ),
    },
    {
      label: 'vague event shorthand',
      regex: /\bm(?:20\/20|2020)\b/i,
    },
  ];
  return patternHits(text, patterns);
}

/**
 * The inbox preview is the subject line's partner. If the first ~18 words start
 * seller-first, the touch has already become a pitch before the buyer reaches
 * the illumination question.
 */
export function findSellerFirstPreviewPhrasing(
  text: string,
  wordWindow = 18,
  bannedPronouns = ['i', 'me', 'my', 'we', 'us', 'our', 'ours'],
): string[] {
  const banned = new Set(bannedPronouns.map((p) => p.toLowerCase()));
  const found = new Set<string>();
  for (const token of previewTokens(text, wordWindow).map(normalizePreviewToken)) {
    if (banned.has(token)) found.add(token);
  }
  return Array.from(found);
}

/**
 * Event-first previews read like a template variable. Buyer responsibility
 * should create relevance; the event should usually support the ask.
 */
export function findEventFirstPreviewPhrasing(
  text: string,
  eventName?: string,
  wordWindow = 12,
): string[] {
  const tokens = previewTokens(text, wordWindow);
  const preview = tokens
    .filter((t) => !/^\{\{[a-z0-9_]+\}\}$/.test(t))
    .join(' ')
    .trim();
  const aliases = eventAliases(eventName).map(escapeRegex);
  const found = new Set<string>();
  for (const alias of aliases) {
    const direct = new RegExp(`^(?:the\\s+)?${alias}\\b`, 'i');
    const prep = new RegExp(
      `^(?:at|before|ahead\\s+of|going\\s+into|during|after|today\\s+at|week\\s+of|the\\s+week\\s+of)\\s+(?:the\\s+)?${alias}\\b`,
      'i',
    );
    const match = preview.match(prep) || preview.match(direct);
    if (match?.[0]) found.add(match[0]);
  }
  return Array.from(found);
}

const DATA_DIR = path.join(process.cwd(), 'data');

let coldEmailBenchmarksCache: ColdEmailBenchmarks | null = null;
let coldOutboundPatternsCache: ColdOutboundPatterns | null = null;
let coldOutboundFrameworksCache: ColdOutboundFrameworks | null = null;
let coldOutboundRulesCache: ColdOutboundRules | null = null;

const FALLBACK_BENCHMARKS: ColdEmailBenchmarks = {
  subject_line_rules: {
    max_word_count: 4,
    all_lowercase: true,
    buzzwords_banned: [
      'AI',
      'platform',
      'leverage',
      'synergy',
      'solution',
      'revolutionary',
      'transform',
      'unlock',
      'supercharge',
    ],
  },
  email_body_targets: {
    min_word_count: 50,
    max_word_count: 100,
    min_sentence_count: 3,
    max_sentence_count: 4,
  },
  pronoun_ratio: { majority_you_your: true },
  cta_type_ranking: [
    { type: 'make_offer', reply_rate_delta: 0.28 },
    { type: 'ask_for_interest', reply_rate_delta: 0.07 },
    { type: 'ask_for_problem', reply_rate_delta: -0.29 },
    { type: 'ask_for_meeting', reply_rate_delta: -0.44 },
  ],
  banned_words_and_phrases: [
    'happy to',
    'excited to',
    'hope this finds you well',
    'just checking in',
    'circling back',
    'touching base',
    'wanted to reach out',
    'quick question',
    'at your convenience',
    'revolutionary',
    'leverage',
    'synergy',
    'solution',
    'best-in-class',
    'paradigm',
    'game-changer',
    'transform',
    'unlock',
    'supercharge',
  ],
  exclamation_marks_banned: true,
  emoji_banned: true,
};

export async function getValidationRules(): Promise<ColdEmailBenchmarks> {
  if (coldEmailBenchmarksCache) return coldEmailBenchmarksCache;
  const filePath = path.join(DATA_DIR, 'cold-email-benchmarks.json');
  try {
    const content = readFileSync(filePath, 'utf-8');
    coldEmailBenchmarksCache = JSON.parse(content) as ColdEmailBenchmarks;
    return coldEmailBenchmarksCache;
  } catch (error) {
    console.error(
      `Error loading cold-email-benchmarks.json from ${filePath}:`,
      error,
    );
    return FALLBACK_BENCHMARKS;
  }
}

export async function getColdOutboundPatterns(): Promise<ColdOutboundPatterns> {
  if (coldOutboundPatternsCache) return coldOutboundPatternsCache;
  const filePath = path.join(DATA_DIR, 'cold-outbound-patterns.md');
  try {
    coldOutboundPatternsCache = readFileSync(filePath, 'utf-8');
    return coldOutboundPatternsCache;
  } catch (error) {
    console.error(`Error loading cold-outbound-patterns.md from ${filePath}:`, error);
    return 'No cold-outbound patterns available.';
  }
}

const FALLBACK_COLD_OUTBOUND_RULES: ColdOutboundRules = {
  channel_length_rules: {
    cold_email_first_touch: { min_words: 50, max_words: 100, min_sent: 3, max_sent: 5 },
    cold_email_followup_2: { min_words: 40, max_words: 90, min_sent: 3, max_sent: 4 },
    cold_email_followup_3plus: { min_words: 25, max_words: 60, min_sent: 2, max_sent: 3 },
    linkedin_connection_request: { max_chars: 200, max_words: 35, min_words: 18, min_sent: 1, max_sent: 2 },
    linkedin_dm_post_connect: { min_words: 50, max_words: 120, min_sent: 3, max_sent: 5 },
    linkedin_day_of_nudge: { min_words: 30, max_words: 60, min_sent: 2, max_sent: 3 },
    post_event_followup: { min_words: 40, max_words: 90, min_sent: 2, max_sent: 4 },
  },
  median_sentence_length_max: 12,
  additional_banned_phrases: [
    'would you be interested',
    'if I could',
    "wouldn't you agree",
    "we're the best",
    "we're the only",
    'industry-leading',
    'world-class',
    'best-in-class',
    'cutting-edge',
    'book a call',
    'schedule a meeting',
    'calendar link',
    '15 minutes',
    '30 minutes',
    'happy to send',
    'happy to share',
    'happy to chat',
    'should i send',
    'can i send',
    'want me to send',
    'want me to share',
    'want me to walk',
    'want the one-pager',
    'want the one-page',
  ],
  leading_question_pattern: {
    regex: "\\b(if I could|wouldn'?t you|don'?t you think|would you be interested|would you agree)\\b",
    flags: 'i',
    fail: true,
  },
  illumination_question_required: {
    applies_to: ['cold_email_first_touch', 'email_cold', 'linkedin_dm_post_connect'],
    regex: '\\b(how|what|why)\\s+(are|do|is|can|could|would|should|did)\\s+(you|your)\\b',
    flags: 'i',
    min_count: 1,
  },
};

export async function getColdOutboundRules(): Promise<ColdOutboundRules> {
  if (coldOutboundRulesCache) return coldOutboundRulesCache;
  const filePath = path.join(DATA_DIR, 'cold-outbound-rules.json');
  try {
    const content = readFileSync(filePath, 'utf-8');
    coldOutboundRulesCache = JSON.parse(content) as ColdOutboundRules;
    return coldOutboundRulesCache;
  } catch (error) {
    console.error(
      `Error loading cold-outbound-rules.json from ${filePath}:`,
      error,
    );
    return FALLBACK_COLD_OUTBOUND_RULES;
  }
}

export async function getColdOutboundFrameworks(): Promise<ColdOutboundFrameworks> {
  if (coldOutboundFrameworksCache) return coldOutboundFrameworksCache;
  const filePath = path.join(DATA_DIR, 'cold-outbound-frameworks.md');
  try {
    coldOutboundFrameworksCache = readFileSync(filePath, 'utf-8');
    return coldOutboundFrameworksCache;
  } catch (error) {
    console.error(
      `Error loading cold-outbound-frameworks.md from ${filePath}:`,
      error,
    );
    return 'No cold-outbound frameworks available.';
  }
}
