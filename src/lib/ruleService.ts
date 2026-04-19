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

const DATA_DIR = path.join(process.cwd(), 'data');

let coldEmailBenchmarksCache: ColdEmailBenchmarks | null = null;
let coldOutboundPatternsCache: ColdOutboundPatterns | null = null;
let coldOutboundFrameworksCache: ColdOutboundFrameworks | null = null;

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
