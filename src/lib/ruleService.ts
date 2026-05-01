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

export type JoshBraunRules = {
  channel_length_rules: { [touchType: string]: ChannelLengthRule };
  median_sentence_length_max: number;
  additional_banned_phrases: string[];
  leading_question_pattern: { regex: string; flags?: string; fail: boolean };
  illumination_question_required: {
    applies_to: string[];
    regex: string;
    flags?: string;
    min_count: number;
  };
  specific_pass_phrases?: { lean_back_ctas?: string[] };
};

const DATA_DIR = path.join(process.cwd(), 'data');

let coldEmailBenchmarksCache: ColdEmailBenchmarks | null = null;
let coldOutboundPatternsCache: ColdOutboundPatterns | null = null;
let coldOutboundFrameworksCache: ColdOutboundFrameworks | null = null;
let joshBraunRulesCache: JoshBraunRules | null = null;

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

const FALLBACK_JB_RULES: JoshBraunRules = {
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

export async function getJoshBraunRules(): Promise<JoshBraunRules> {
  if (joshBraunRulesCache) return joshBraunRulesCache;
  const filePath = path.join(DATA_DIR, 'josh-braun-rules.json');
  try {
    const content = readFileSync(filePath, 'utf-8');
    joshBraunRulesCache = JSON.parse(content) as JoshBraunRules;
    return joshBraunRulesCache;
  } catch (error) {
    console.error(
      `Error loading josh-braun-rules.json from ${filePath}:`,
      error,
    );
    return FALLBACK_JB_RULES;
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
