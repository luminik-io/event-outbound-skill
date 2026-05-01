import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

import {
  EventContext,
  CompanyICP,
  SequenceParams,
  SequencerOutput,
  OutreachSequence,
  OutreachTouch,
  AttendeePersona,
  CTAType,
  CTA_TYPES,
  ValidationResult,
  ValidationError,
  TimelineTouchpoint,
} from '../types/index.js';
import {
  getValidationRules,
  getColdOutboundPatterns,
  getColdOutboundFrameworks,
  getJoshBraunRules,
  findLlmCliches,
  ColdEmailBenchmarks,
  JoshBraunRules,
  ChannelLengthRule,
} from '../lib/ruleService.js';
import { generateTimeline } from '../lib/timeline.js';

// ---------------------------------------------------------------------------
// Zod schema for a single touch returned by the LLM.
// ---------------------------------------------------------------------------

const OutreachTouchSchema = z.object({
  subject: z
    .string()
    .describe(
      'All-lowercase subject line, max 4 words. Empty string only for LinkedIn touches.',
    ),
  body: z
    .string()
    .describe(
      'Channel-aware body. Cold email: 50-100 words, 3-5 sentences. LinkedIn connect: 18-35 words / under 200 chars. LinkedIn DM: 50-120 words. Day-of nudge: 30-60 words. Post-event: 40-90 words. Follows the 4T framework: Trigger -> Think (illumination question) -> Third-party validation -> Talk? (lean-back CTA).',
    ),
  cta_type: z.enum(CTA_TYPES).describe(
    'CTA type. Prefer make_offer or ask_for_interest. "none" only for LinkedIn connection requests.',
  ),
});

type LLMTouch = z.infer<typeof OutreachTouchSchema>;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function countWords(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0).length;
}

function countSentences(s: string): number {
  const matches = s.match(/[.!?]+/g);
  return matches ? matches.length : 0;
}

const EMOJI_REGEX =
  /[©® -㌀]|\ud83c[퀀-\udfff]|\ud83d[퀀-\udfff]|\ud83e[퀀-\udfff]/;

function findBannedPhrases(text: string, banned: string[]): string[] {
  const hay = text.toLowerCase();
  const found = new Set<string>();
  for (const b of banned) {
    if (b && hay.includes(b.toLowerCase())) {
      found.add(b);
    }
  }
  return Array.from(found);
}

function computeYouVsWeRatio(body: string): number {
  const youCount = (body.toLowerCase().match(/\b(you|your)\b/g) || []).length;
  const weCount = (body.toLowerCase().match(/\b(we|our)\b/g) || []).length;
  if (weCount === 0) return youCount > 0 ? Infinity : 0;
  return youCount / weCount;
}

// ---------------------------------------------------------------------------
// Channel-aware touch type lookup. Maps the timeline's `brief.label` to a key
// in josh-braun-rules.json's channel_length_rules block.
// ---------------------------------------------------------------------------

function resolveTouchTypeKey(briefLabel: string): string {
  switch (briefLabel) {
    case 'email_cold':
      return 'cold_email_first_touch';
    case 'email_followup':
      return 'post_event_followup';
    case 'linkedin_connect':
      return 'linkedin_connection_request';
    case 'linkedin_nudge':
      return 'linkedin_day_of_nudge';
    case 'linkedin_day_of':
      return 'linkedin_day_of_nudge';
    case 'linkedin_followup':
      return 'post_event_followup';
    default:
      return 'cold_email_first_touch';
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateTouch(
  touch: {
    subject: string;
    body: string;
    cta_type: CTAType;
    channel: 'email' | 'linkedin';
    touch_type: string;
  },
  eventContext: EventContext,
  persona: AttendeePersona,
  rules: ColdEmailBenchmarks,
  jbRules: JoshBraunRules,
): {
  result: ValidationResult;
  checks: OutreachTouch['checks'];
} {
  const errors: ValidationError[] = [];
  const isLinkedIn = touch.channel === 'linkedin';
  const combined = `${touch.subject} ${touch.body}`;
  const bodyLower = touch.body.toLowerCase();

  const subjectWordCount = countWords(touch.subject);
  if (!isLinkedIn) {
    if (subjectWordCount === 0) {
      errors.push({ rule: 'emptySubject', message: 'Email subject is empty.' });
    } else if (subjectWordCount > rules.subject_line_rules.max_word_count) {
      errors.push({
        rule: 'subjectWordCount',
        message: `Subject has ${subjectWordCount} words; max ${rules.subject_line_rules.max_word_count}.`,
      });
    }
    if (
      rules.subject_line_rules.all_lowercase &&
      touch.subject !== touch.subject.toLowerCase()
    ) {
      errors.push({
        rule: 'allLowercase',
        message: 'Subject must be all lowercase.',
      });
    }
    if (rules.subject_line_rules.numbers_banned && /\d/.test(touch.subject)) {
      errors.push({
        rule: 'subjectNumbers',
        message: 'Subject must not contain digits.',
      });
    }
  }

  if (!isLinkedIn && touch.subject.includes(':')) {
    const colonWords = touch.subject
      .split(/[:\s]+/)
      .filter((w) => w.length > 0).length;
    if (colonWords > rules.subject_line_rules.max_word_count) {
      errors.push({
        rule: 'subjectWordCount',
        message: `Subject (with colon-split) reads as ${colonWords} words; max ${rules.subject_line_rules.max_word_count}.`,
      });
    }
  }

  // ---- Channel-aware length rules (NEW) -----------------------------------
  const ruleKey = touch.touch_type;
  const lenRule: ChannelLengthRule | undefined =
    jbRules.channel_length_rules[ruleKey];
  const bodyWordCount = countWords(touch.body);
  const sentenceCount = countSentences(touch.body);
  const bodyCharCount = touch.body.length;

  if (lenRule) {
    if (lenRule.min_words !== undefined && bodyWordCount < lenRule.min_words) {
      errors.push({
        rule: 'bodyWordCount',
        message: `Body length ${bodyWordCount} words; expected min ${lenRule.min_words} for ${ruleKey}.`,
      });
    }
    if (lenRule.max_words !== undefined && bodyWordCount > lenRule.max_words) {
      errors.push({
        rule: 'bodyWordCount',
        message: `Body length ${bodyWordCount} words; expected max ${lenRule.max_words} for ${ruleKey}.`,
      });
    }
    if (lenRule.min_sent !== undefined && sentenceCount < lenRule.min_sent) {
      errors.push({
        rule: 'bodySentenceCount',
        message: `Body has ${sentenceCount} sentences; expected min ${lenRule.min_sent} for ${ruleKey}.`,
      });
    }
    if (lenRule.max_sent !== undefined && sentenceCount > lenRule.max_sent) {
      errors.push({
        rule: 'bodySentenceCount',
        message: `Body has ${sentenceCount} sentences; expected max ${lenRule.max_sent} for ${ruleKey}.`,
      });
    }
    if (lenRule.max_chars !== undefined && bodyCharCount > lenRule.max_chars) {
      errors.push({
        rule: 'bodyCharCount',
        message: `Body has ${bodyCharCount} chars; expected max ${lenRule.max_chars} for ${ruleKey}.`,
      });
    }
  } else {
    if (
      bodyWordCount < rules.email_body_targets.min_word_count ||
      bodyWordCount > rules.email_body_targets.max_word_count
    ) {
      errors.push({
        rule: 'bodyWordCount',
        message: `Body length ${bodyWordCount} words; expected ${rules.email_body_targets.min_word_count}-${rules.email_body_targets.max_word_count}.`,
      });
    }
    if (
      sentenceCount < rules.email_body_targets.min_sentence_count ||
      sentenceCount > rules.email_body_targets.max_sentence_count
    ) {
      errors.push({
        rule: 'bodySentenceCount',
        message: `Body has ${sentenceCount} sentences; expected ${rules.email_body_targets.min_sentence_count}-${rules.email_body_targets.max_sentence_count}.`,
      });
    }
  }

  // ---- Banned phrases (CEB + JB merged) -----------------------------------
  const allBanned = [
    ...rules.banned_words_and_phrases,
    ...jbRules.additional_banned_phrases,
  ];
  const bannedFound = findBannedPhrases(combined, allBanned);
  if (bannedFound.length > 0) {
    errors.push({
      rule: 'bannedWords',
      message: `Banned words/phrases present: ${bannedFound.join(', ')}.`,
      offendingValue: bannedFound.join(', '),
    });
  }

  // ---- LLM-cliche blocklist ----------------------------------------------
  // Catches phrases that mark text as LLM-generated even when the JB and
  // CEB lists pass: performative empathy openers ("stuck with me"),
  // GPT-overused vocab ("delve"), LLM transition tics ("Moreover,"), etc.
  // Hard-ban categories trigger validation errors with a per-category tag
  // so the operator can see which family fired. Soft-warning categories
  // (currently just `hedge_softener_warnings`) get persisted in checks
  // but don't fail validation.
  const cliches = findLlmCliches(combined, jbRules.llm_cliche_blocklist);
  for (const [cat, hits] of Object.entries(cliches.hardBans)) {
    if (hits && hits.length > 0) {
      errors.push({
        rule: `llmCliche:${cat}`,
        message: `LLM-cliche (${cat}) phrases present: ${hits.join(', ')}.`,
        offendingValue: hits.join(', '),
      });
    }
  }
  // Track soft warnings on the checks object below; they don't fail this loop.

  const subjectBuzzwords = findBannedPhrases(
    touch.subject,
    rules.subject_line_rules.buzzwords_banned,
  );
  if (subjectBuzzwords.length > 0) {
    errors.push({
      rule: 'subjectBuzzwords',
      message: `Subject contains banned buzzwords: ${subjectBuzzwords.join(', ')}.`,
      offendingValue: subjectBuzzwords.join(', '),
    });
  }

  // ---- Pronoun ratio ------------------------------------------------------
  const youVsWe = computeYouVsWeRatio(touch.body);
  if (rules.pronoun_ratio.majority_you_your) {
    if (youVsWe < 1) {
      errors.push({
        rule: 'pronounRatio',
        message: `You/We pronoun ratio is ${youVsWe.toFixed(2)}; expected majority you/your.`,
      });
    }
  }

  // ---- CTA type ----------------------------------------------------------
  const preferredCtas = rules.cta_type_ranking
    .filter((c) => c.reply_rate_delta >= 0)
    .map((c) => c.type);
  if (touch.cta_type !== 'none' && !preferredCtas.includes(touch.cta_type)) {
    errors.push({
      rule: 'ctaType',
      message: `CTA '${touch.cta_type}' is dispreferred. Use one of: ${preferredCtas.join(', ')}.`,
    });
  }

  // ---- Exclamation / emoji / em-dash ------------------------------------
  const hasExclamation = /[!]/.test(combined);
  const hasEmoji = EMOJI_REGEX.test(combined);
  const hasEmDash = /—/.test(combined);

  if (rules.exclamation_marks_banned && hasExclamation) {
    errors.push({ rule: 'exclamationMark', message: 'No exclamation marks allowed.' });
  }
  if (rules.emoji_banned && hasEmoji) {
    errors.push({ rule: 'emoji', message: 'No emoji allowed.' });
  }
  if (hasEmDash) {
    errors.push({
      rule: 'emDash',
      message:
        'Em-dash (—) found. Replace with period, colon, comma, or parentheses.',
    });
  }

  // ---- Leading-question / moon-and-stars regex (NEW) --------------------
  const leadingRegex = new RegExp(
    jbRules.leading_question_pattern.regex,
    jbRules.leading_question_pattern.flags || 'i',
  );
  const hasLeadingQuestion = leadingRegex.test(touch.body);
  if (hasLeadingQuestion && jbRules.leading_question_pattern.fail) {
    errors.push({
      rule: 'leadingQuestion',
      message:
        'Body contains a leading / moon-and-stars question pattern. Use a neutral how/what/why-are-you illumination question instead.',
    });
  }

  // ---- Illumination-question heuristic (NEW) -----------------------------
  const iqSpec = jbRules.illumination_question_required;
  const baseFlags = (iqSpec.flags || 'i').replace('g', '');
  const iqRegex = new RegExp(iqSpec.regex, baseFlags + 'g');
  const iqMatches = bodyLower.match(iqRegex) || [];
  const hasIlluminationQuestion = iqMatches.length >= iqSpec.min_count;
  if (iqSpec.applies_to.includes(ruleKey) && !hasIlluminationQuestion) {
    errors.push({
      rule: 'illuminationQuestion',
      message: `${ruleKey} must contain at least ${iqSpec.min_count} neutral how/what/why-are-you question.`,
    });
  }

  // ---- Specificity heuristic --------------------------------------------
  const eventTokens = eventContext.name
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 3);
  const priorityTokens = persona.priorities
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 4);
  const painTokens = persona.painPoints
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 4);
  const allTokens = [...eventTokens, ...priorityTokens, ...painTokens];
  const combinedLower = combined.toLowerCase();
  const specificityHits = allTokens.filter((t) => combinedLower.includes(t)).length;
  if (specificityHits === 0) {
    errors.push({
      rule: 'specificity',
      message:
        'Touch lacks event-name / persona-priority / pain-point specificity.',
    });
  }

  const checks: OutreachTouch['checks'] = {
    subjectWordCount,
    allLowercase: touch.subject === touch.subject.toLowerCase(),
    bodyWordCount,
    bodyCharCount,
    bodySentenceCount: sentenceCount,
    bannedWordsFound: bannedFound,
    youVsWeRatio: Number.isFinite(youVsWe) ? youVsWe : youVsWe === Infinity ? 99 : 0,
    hasIlluminationQuestion,
    hasLeadingQuestion,
    hasEmDash,
    hasExclamation,
    hasEmoji,
    specificityHits,
  };

  return { result: { isValid: errors.length === 0, errors }, checks };
}

// ---------------------------------------------------------------------------
// LLM prompt construction
// ---------------------------------------------------------------------------

function touchBrief(
  touchpoint: TimelineTouchpoint,
  _leadTimeWeeks: number,
): { label: string; instruction: string } {
  const { channel, offset_days } = touchpoint;
  if (channel === 'linkedin' && offset_days <= -14) {
    return {
      label: 'linkedin_connect',
      instruction:
        'LinkedIn connection request. 18-35 words / max 200 chars / 1-2 sentences. Mention the event by name + one specific observation. Subject empty. CTA type: none. NO illumination question required (compress 4T into 3 sentences max).',
    };
  }
  if (channel === 'linkedin' && offset_days < 0) {
    return {
      label: 'linkedin_nudge',
      instruction:
        'Pre-event LinkedIn nudge. 30-60 words / 2-3 sentences. Reference the upcoming event + one specific pain point. Lean-back CTA. CTA type: ask_for_interest or make_offer.',
    };
  }
  if (channel === 'linkedin' && offset_days === 0) {
    return {
      label: 'linkedin_day_of',
      instruction:
        'Day-of LinkedIn message. 30-60 words / 2-3 sentences. Reference a concrete time + place. One CTA. CTA type: ask_for_interest.',
    };
  }
  if (channel === 'linkedin' && offset_days > 0) {
    return {
      label: 'linkedin_followup',
      instruction:
        'Post-event LinkedIn follow-up. 40-90 words / 2-4 sentences. Reference something specific from the event. Lean-back CTA. CTA type: make_offer.',
    };
  }
  if (channel === 'email' && offset_days < 0) {
    return {
      label: 'email_cold',
      instruction:
        'Pre-event cold email. 50-100 words / 3-5 sentences. Subject all lowercase, max 4 words, no colons, no digits. Follow the 4T framework: Trigger (specific observation) -> Think (neutral how/what/why-are-you illumination question) -> Third-party validation (peer/customer + contrast number) -> Talk? (lean-back CTA). CTA type: make_offer.',
    };
  }
  return {
    label: 'email_followup',
    instruction:
      'Post-event follow-up email. 40-90 words / 2-4 sentences. Reference the event in past tense WITHOUT cliches like "hope the event was productive". Trigger from a session/topic, neutral question, third-party validation, lean-back CTA. CTA type: make_offer.',
  };
}

function buildSystemPrompt(rules: ColdEmailBenchmarks, jb: JoshBraunRules): string {
  const lengthTable = Object.entries(jb.channel_length_rules)
    .map(([k, v]) => {
      const parts: string[] = [];
      if (v.min_words !== undefined || v.max_words !== undefined) {
        parts.push(`${v.min_words ?? '?'}-${v.max_words ?? '?'} words`);
      }
      if (v.min_sent !== undefined || v.max_sent !== undefined) {
        parts.push(`${v.min_sent ?? '?'}-${v.max_sent ?? '?'} sentences`);
      }
      if (v.max_chars !== undefined) parts.push(`max ${v.max_chars} chars`);
      return `  ${k}: ${parts.join(', ')}`;
    })
    .join('\n');

  return `You are writing B2B outbound touches in the **Josh Braun 4T framework**. Every line must read
aloud like a text from a smart peer noticing something specific, not a vendor blast. The bar: if the
recipient screenshots your copy, the comment should be "textbook Josh Braun", not "another LLM blast".

==========================================================================================
THE 4T FRAMEWORK (every cold email and post-event email follows this; LinkedIn DMs follow it
loosely; LinkedIn connection requests compress it to 2-3 sentences)
==========================================================================================
1. **Trigger** - Why this person, why now? A specific observation. Pattern: "looks like / noticed
   / seems like [observable thing] which suggests [deduction]." Examples:
     - "noticed you're hiring SDRs which suggests you might be sending lots of cold emails"
     - "looks like you have 9 SDRs cold calling Directors of Benefits and CHROs"
     - "looks like you just cut the cord, which suggests you're subscribed to Netflix, Hulu..."
     - Situation trigger when no signal: "end of the month and lots of commissions to pay"
2. **Think** - the **illumination question**. Neutral "how / what / why are you..." question that
   shines a light on a problem the prospect probably hasn't thought through. Top 5 patterns:
     - "How are you ensuring [bad outcome] doesn't [happen]?"
     - "How are you reducing the risk of [bad outcome] caused by [trigger context]?"
     - "How are you dealing with [specific painful current process]?"
     - "How are you giving your reps more [resource]?"
     - "How do you know your [thing] isn't at risk of [bad outcome]?"
   FAILS: "Wouldn't you agree...", "If I could 10x your X, would you be interested?",
   "Would you be open to a 30-min call?" - these are leading / moon-and-stars and AUTO-REJECTED.
3. **Third-party validation** - let other people toot your horn. ONE sentence naming peer customers
   plus a contrast number. The contrast is what sells. Pattern: "[Peer A] and [Peer B] are using
   us to [outcome] [SHARP NUMBER] compared to [old number] before." Then ONE bridging sentence on
   how it works ("it involves [crispy specific mechanism]"). NEVER "we're the best",
   "industry-leading", "world-class".
4. **Talk?** - interest-based CTA, with a question mark. Lean-back energy. Approved closers:
     "Worth a look?" / "Worth a peek sometime?" / "Worth a skim?" / "Worth an exchange?"
     "Open to learning more?" / "Open to comparing notes?" / "Worth a conversation?"
   BANNED closers: "Do you have 15 minutes?", "Would you be open to a 30-minute call?",
   "Can we book time on your calendar?", "schedule a meeting".

==========================================================================================
CHANNEL-SPECIFIC LENGTH TABLE (HARD RULES)
==========================================================================================
${lengthTable}

==========================================================================================
TWO CANONICAL PASS EXAMPLES (study the SHAPE, not the literal copy)
==========================================================================================
Pass A - Warmbox cold email (4T canonical):
> Subject: cold emails in spam?
>
> noticed you're hiring SDRs which suggests you might be sending lots of cold emails. how are
> you ensuring cold emails don't land in spam? Google and Salesforce are using us to deliver
> 94% of cold emails to inboxes compared to 12% before. it involves a warm-up tool that raises
> your inbox reputation. open to a look?

Pass B - TitanX cold email (JB's own LinkedIn 4T post):
> Subject: more at bats
>
> Pete, looks like you have 9 SDRs cold calling Directors of Benefits and CHROs. how are you
> giving your reps more at bats? SDRs using TitanX have 6-8 conversations every 50 dials,
> compared to 1-2 before. we identify the people most likely to answer. no long-term contracts
> or new tech to implement. open to learning more?

==========================================================================================
ONE CANONICAL FAIL EXAMPLE (do NOT regress to this)
==========================================================================================
Fail - moon-and-stars (eight separate violations):
> Subject: 10x your pipeline
>
> Hi Pete, hope this finds you well! If I could 10x your outbound pipeline in the next 90 days,
> would you be interested? We're the industry-leading platform that's revolutionizing the way
> modern revenue teams unlock their growth potential. Happy to share a quick 15-min demo at your
> convenience!

Why it fails: "10x" + numbers in subject; "hope this finds you well"; leading question
("would you be interested"); self-praise ("industry-leading", "revolutionizing"); buzzword stack
("platform", "unlock", "growth potential"); pitchy CTA ("15-min demo"); exclamation marks;
"happy to" cliche. Eight violations.

==========================================================================================
PSYCHOLOGICAL FRAME (the "why" behind the rules)
==========================================================================================
Prospects are biased against salespeople. They have **commission breath**. Persuasion
("we're the best", "10x your revenue") triggers the **zone of resistance**. The way out: shine a
light on a problem the prospect doesn't know they have, and let them discover the value
themselves. Lean-back beats lean-forward. A neutral question beats a pitch. Third-party
validation beats self-praise. The CTA should sound like you're indifferent to whether they reply.

==========================================================================================
APOLLO / MERGE FIELDS (hard requirement)
==========================================================================================
Output is destined for Apollo / Outreach / Salesloft / Instantly / Smartlead, so every
recipient-specific reference MUST use merge-field syntax. NEVER hard-code a name ("Elena"), a
company ("Klarna"), or a titled cohort. REQUIRED:
- {{first_name}} - recipient first name (use at least once)
- {{company}} - recipient company (use at least once)
- {{title}} - recipient job title
- {{event_name}}, {{event_city}}, {{event_venue}} - when referencing the event
NEVER write [Name] / [Company] / <first_name> placeholders.

==========================================================================================
HARD VALIDATOR RULES (auto-rejected)
==========================================================================================
- Subject: all lowercase, max ${rules.subject_line_rules.max_word_count} words, no colons, no
  digits, no buzzwords. Subject is static text - do NOT put merge fields in the subject.
- Body length: per the channel table above.
- Cold emails AND post-connect DMs MUST contain a "how/what/why ARE/DO/IS you/your"
  illumination question. (Connection requests are exempt.)
- NO leading / moon-and-stars patterns: "if I could...", "would you be interested?",
  "wouldn't you agree?", "would you agree...", "don't you think..." - AUTO-REJECTED.
- NO em-dashes (—). Use comma, period, or parentheses.
- NO exclamation marks. NO emoji.
- "you/your" must outnumber "we/our" in the body.
- Banned phrases (CEB + JB merged): ${rules.banned_words_and_phrases.slice(0, 30).join(', ')},
  plus ${jb.additional_banned_phrases.slice(0, 25).join(', ')}.
- Banned subject buzzwords: ${rules.subject_line_rules.buzzwords_banned.slice(0, 30).join(', ')}.
- ONE problem per email. Don't mash multiple value props in one touch.
- Address {{first_name}} at least once; reference {{company}} at least once.
- Lean-back CTA from the approved list. ONE per touch.

Preferred CTAs by reply-rate delta:
${rules.cta_type_ranking.map((c) => `  - ${c.type}: ${c.reply_rate_delta > 0 ? '+' : ''}${(c.reply_rate_delta * 100).toFixed(0)}%`).join('\n')}
`;
}

function buildUserPrompt(
  eventContext: EventContext,
  _companyIcp: CompanyICP,
  persona: AttendeePersona,
  sequenceParams: SequenceParams,
  touchpoint: TimelineTouchpoint,
  brief: ReturnType<typeof touchBrief>,
  previousErrors: ValidationError[],
): string {
  const retryNote = previousErrors.length
    ? `\n\nPREVIOUS ATTEMPT FAILED these rules - fix them: ${previousErrors.map((e) => e.rule + ': ' + e.message).join(' | ')}`
    : '';
  return `Event: ${eventContext.name} (${eventContext.dates}, ${eventContext.location}).
Agenda: ${eventContext.agendaTitles.slice(0, 6).join('; ') || 'n/a'}.

Target persona: ${persona.role} (${persona.seniority}).
Priorities: ${persona.priorities.join('; ')}.
Pain points: ${persona.painPoints.join('; ')}.

Sender: ${sequenceParams.sendingIdentity.name}, ${sequenceParams.sendingIdentity.title} at ${sequenceParams.sendingIdentity.company}.

Touch: slot ${touchpoint.touch_slot}, channel ${touchpoint.channel}, offset ${touchpoint.offset_days}d (${brief.label}).
${brief.instruction}${retryNote}

Apply the 4T framework. Map the persona's pain points to the Trigger and Think question. Use a
specific peer + contrast number for the Third-party slot. Close with a lean-back CTA.

Address the recipient with {{first_name}} and reference their company as {{company}}. NEVER
hard-code a specific company name or persona cohort. Write only the subject and body - no
signature block, no greeting with "Hey".`;
}

// ---------------------------------------------------------------------------
// LLM provider. Allows an injected stub for tests / examples.
// ---------------------------------------------------------------------------

export type TouchGenerator = (args: {
  system: string;
  user: string;
  temperature: number;
}) => Promise<LLMTouch>;

export function makeGeminiTouchGenerator(apiKey?: string): TouchGenerator {
  const key = apiKey ?? process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'GEMINI_API_KEY is not set. Provide an API key or inject a TouchGenerator.',
    );
  }
  const google = createGoogleGenerativeAI({ apiKey: key });
  const model = google('gemini-2.5-flash');
  return async ({ system, user, temperature }) => {
    const { object } = await generateObject({
      model,
      schema: OutreachTouchSchema,
      system,
      prompt: user,
      temperature,
    });
    return object;
  };
}

// ---------------------------------------------------------------------------
// Validator-only entry point - used by evals + external callers.
// ---------------------------------------------------------------------------

export async function validateTouchExternal(
  touch: {
    subject: string;
    body: string;
    cta_type: CTAType;
    channel: 'email' | 'linkedin';
    touch_type: string;
  },
  eventContext: EventContext,
  persona: AttendeePersona,
): Promise<{ result: ValidationResult; checks: OutreachTouch['checks'] }> {
  const rules = await getValidationRules();
  const jbRules = await getJoshBraunRules();
  return validateTouch(touch, eventContext, persona, rules, jbRules);
}

// ---------------------------------------------------------------------------
// Main entry point.
// ---------------------------------------------------------------------------

export async function generateSequence(
  eventContext: EventContext,
  companyIcp: CompanyICP,
  sequenceParams: SequenceParams,
  touchGenerator?: TouchGenerator,
): Promise<SequencerOutput> {
  const sequencesByPersona: { [personaId: string]: OutreachSequence } = {};

  const validationRules = await getValidationRules();
  const jbRules = await getJoshBraunRules();
  await getColdOutboundPatterns();
  await getColdOutboundFrameworks();

  const systemPrompt = buildSystemPrompt(validationRules, jbRules);

  const llm = touchGenerator ?? makeGeminiTouchGenerator();

  if (!companyIcp.personas || companyIcp.personas.length === 0) {
    console.warn('No personas in CompanyICP; returning empty output.');
    return { sequencesByPersona: {} };
  }

  for (const persona of companyIcp.personas) {
    const outreachSequence: OutreachSequence = {
      personaId: persona.personaId,
      touches: [],
      leadTimeWeeks: sequenceParams.leadTimeWeeks,
      channels: sequenceParams.channels,
    };

    const timeline = generateTimeline(
      sequenceParams.leadTimeWeeks,
      sequenceParams.channels,
    );

    for (const touchpoint of timeline) {
      const brief = touchBrief(touchpoint, sequenceParams.leadTimeWeeks);
      const touchTypeKey = resolveTouchTypeKey(brief.label);
      const maxAttempts = 3;
      let previousErrors: ValidationError[] = [];
      let finalTouch: OutreachTouch | null = null;
      let lastBuilt: OutreachTouch | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const temperature = 0.6 + (attempt - 1) * 0.2;
        const userPrompt = buildUserPrompt(
          eventContext,
          companyIcp,
          persona,
          sequenceParams,
          touchpoint,
          brief,
          previousErrors,
        );

        let llmTouch: LLMTouch;
        try {
          llmTouch = await llm({
            system: systemPrompt,
            user: userPrompt,
            temperature,
          });
        } catch (err) {
          console.error(
            `LLM call failed for ${brief.label} attempt ${attempt}:`,
            err,
          );
          previousErrors = [
            {
              rule: 'llmError',
              message: err instanceof Error ? err.message : String(err),
            },
          ];
          continue;
        }

        const { result: vr, checks } = validateTouch(
          {
            subject: llmTouch.subject,
            body: llmTouch.body,
            cta_type: llmTouch.cta_type,
            channel: touchpoint.channel,
            touch_type: touchTypeKey,
          },
          eventContext,
          persona,
          validationRules,
          jbRules,
        );

        const builtTouch: OutreachTouch = {
          send_at_offset_days: touchpoint.offset_days,
          channel: touchpoint.channel,
          touch_type: brief.label,
          subject: llmTouch.subject,
          body: llmTouch.body,
          word_count: countWords(llmTouch.body),
          cta_type: llmTouch.cta_type,
          checks,
          validation_errors: vr.errors.length > 0 ? vr.errors : undefined,
        };
        lastBuilt = builtTouch;

        if (vr.isValid) {
          finalTouch = builtTouch;
          break;
        }

        previousErrors = vr.errors;
        console.warn(
          `Validation failed for ${brief.label} (attempt ${attempt}):`,
          vr.errors.map((e) => e.rule).join(', '),
        );

        if (attempt === maxAttempts) {
          builtTouch.quality_flag = 'rules_violated';
          finalTouch = builtTouch;
        }
      }

      if (!finalTouch && lastBuilt) {
        lastBuilt.quality_flag = 'rules_violated';
        finalTouch = lastBuilt;
      }

      if (finalTouch) {
        outreachSequence.touches.push(finalTouch);
      }
    }

    sequencesByPersona[persona.personaId] = outreachSequence;
  }

  return { sequencesByPersona };
}

export { OutreachTouchSchema };
