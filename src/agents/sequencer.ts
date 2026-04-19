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
  ColdEmailBenchmarks,
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
      '50–100 word body, 3–4 sentences. Follows Personalization → Problem → Solution → CTA structure.',
    ),
  cta_type: z.enum(CTA_TYPES).describe(
    'The CTA type used in this touch. Prefer make_offer, then ask_for_interest.',
  ),
});

type LLMTouch = z.infer<typeof OutreachTouchSchema>;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function countWords(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0).length;
}

function countSentences(s: string): number {
  // Count terminal punctuation. Good enough for short cold emails.
  const matches = s.match(/[.!?]+/g);
  return matches ? matches.length : 0;
}

// Simple emoji heuristic — covers the common BMP + SMP emoji ranges.
const EMOJI_REGEX =
  /[\u00a9\u00ae\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/;

function findBannedPhrases(text: string, banned: string[]): string[] {
  const hay = text.toLowerCase();
  return banned.filter((b) => hay.includes(b.toLowerCase()));
}

function computeYouVsWeRatio(body: string): number {
  const youCount = (body.toLowerCase().match(/\b(you|your)\b/g) || []).length;
  const weCount = (body.toLowerCase().match(/\b(we|our)\b/g) || []).length;
  if (weCount === 0) return youCount > 0 ? Infinity : 0;
  return youCount / weCount;
}

function validateTouch(
  touch: { subject: string; body: string; cta_type: CTAType; channel: 'email' | 'linkedin' },
  eventContext: EventContext,
  persona: AttendeePersona,
  rules: ColdEmailBenchmarks,
): ValidationResult {
  const errors: ValidationError[] = [];
  const isLinkedIn = touch.channel === 'linkedin';

  // Subject — email touches must have a real subject; LinkedIn touches may be empty.
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
  }

  // Colons count as separators — "foo: bar baz" is 3 words visually.
  // Normalize to catch the "saastr annual: pipeline focus" case (4 tokens
  // but reads as 5). We count colon-separated chunks as extra words.
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

  // Body length
  const bodyWordCount = countWords(touch.body);
  if (
    bodyWordCount < rules.email_body_targets.min_word_count ||
    bodyWordCount > rules.email_body_targets.max_word_count
  ) {
    errors.push({
      rule: 'bodyWordCount',
      message: `Body length ${bodyWordCount} words; expected ${rules.email_body_targets.min_word_count}–${rules.email_body_targets.max_word_count}.`,
    });
  }

  const sentenceCount = countSentences(touch.body);
  if (
    sentenceCount < rules.email_body_targets.min_sentence_count ||
    sentenceCount > rules.email_body_targets.max_sentence_count
  ) {
    errors.push({
      rule: 'bodySentenceCount',
      message: `Body has ${sentenceCount} sentences; expected ${rules.email_body_targets.min_sentence_count}–${rules.email_body_targets.max_sentence_count}.`,
    });
  }

  // Banned words (body + subject)
  const combined = `${touch.subject} ${touch.body}`;
  const bannedFound = findBannedPhrases(combined, rules.banned_words_and_phrases);
  if (bannedFound.length > 0) {
    errors.push({
      rule: 'bannedWords',
      message: `Banned words/phrases present: ${bannedFound.join(', ')}.`,
      offendingValue: bannedFound.join(', '),
    });
  }

  // Subject buzzwords
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

  // Pronoun ratio (real \b word boundaries).
  if (rules.pronoun_ratio.majority_you_your) {
    const ratio = computeYouVsWeRatio(touch.body);
    if (ratio < 1) {
      errors.push({
        rule: 'pronounRatio',
        message: `You/We pronoun ratio is ${ratio.toFixed(2)}; expected majority you/your.`,
      });
    }
  }

  // CTA type preference: allow top-2 positive-delta CTAs and "none" for non-CTA LI touches.
  const preferredCtas = rules.cta_type_ranking
    .filter((c) => c.reply_rate_delta >= 0)
    .map((c) => c.type);
  if (touch.cta_type !== 'none' && !preferredCtas.includes(touch.cta_type)) {
    errors.push({
      rule: 'ctaType',
      message: `CTA '${touch.cta_type}' is dispreferred. Use one of: ${preferredCtas.join(', ')}.`,
    });
  }

  // Exclamation marks / emoji.
  if (rules.exclamation_marks_banned && /[!]/.test(combined)) {
    errors.push({ rule: 'exclamationMark', message: 'No exclamation marks allowed.' });
  }
  if (rules.emoji_banned && EMOJI_REGEX.test(combined)) {
    errors.push({ rule: 'emoji', message: 'No emoji allowed.' });
  }

  // Specificity heuristic: at least one event-name token or persona priority
  // keyword must appear in the body or subject.
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
  const hasSpecificity = allTokens.some((t) => combinedLower.includes(t));
  if (!hasSpecificity) {
    errors.push({
      rule: 'specificity',
      message:
        'Touch lacks event-name / persona-priority / pain-point specificity.',
    });
  }

  return { isValid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// LLM prompt construction
// ---------------------------------------------------------------------------

function touchBrief(
  touchpoint: TimelineTouchpoint,
  leadTimeWeeks: number,
): { label: string; instruction: string } {
  const { channel, offset_days, touch_slot } = touchpoint;
  const day = offset_days < 0 ? `${Math.abs(offset_days)}d before event` : offset_days === 0 ? 'day of event' : `${offset_days}d after event`;
  if (channel === 'linkedin' && offset_days <= -14) {
    return {
      label: 'linkedin_connect',
      instruction:
        'This is an early LinkedIn connection request. Keep it under 30 words. Mention the event by name and a shared interest. Subject should be empty or 2 words max. CTA type: none.',
    };
  }
  if (channel === 'linkedin' && offset_days < 0) {
    return {
      label: 'linkedin_nudge',
      instruction:
        'This is a pre-event LinkedIn nudge. 30–60 words. Reference the upcoming event and one specific pain point. CTA type: ask_for_interest or make_offer.',
    };
  }
  if (channel === 'linkedin' && offset_days === 0) {
    return {
      label: 'linkedin_day_of',
      instruction:
        'Day-of LinkedIn message. Acknowledge they are likely at the event. 30–50 words. CTA type: ask_for_interest.',
    };
  }
  if (channel === 'linkedin' && offset_days > 0) {
    return {
      label: 'linkedin_followup',
      instruction:
        'Post-event LinkedIn follow-up. 30–60 words. Reference something specific (an agenda topic or persona priority). CTA type: make_offer.',
    };
  }
  if (channel === 'email' && offset_days < 0) {
    return {
      label: 'email_cold',
      instruction:
        'Pre-event cold email. 50–100 words, 3–4 sentences. Subject all lowercase, max 4 words, no colons. Follow Personalization → Problem → Solution → CTA. CTA type: make_offer.',
    };
  }
  // email post-event
  return {
    label: 'email_followup',
    instruction:
      'Post-event follow-up email. 50–100 words, 3–4 sentences. Reference the event in the past tense without the forbidden phrase "hope the event was productive" or similar niceties. CTA type: make_offer.',
  };
}

function buildSystemPrompt(
  rules: ColdEmailBenchmarks,
  patterns: string,
  frameworks: string,
): string {
  return `You are writing B2B outbound touches in a permission-based cold-outbound style.
Output is destined for Apollo.io / Outreach / Salesloft / Instantly / Smartlead sequences, so every
recipient-specific reference MUST use merge-field syntax: {{first_name}}, {{company}}, {{title}}.
NEVER hard-code names ("Elena"), companies ("Klarna"), or titles ("VP Marketing at fintech scaleups")
— those belong as merge fields.

REQUIRED MERGE FIELDS (use at least the first three in every touch):
- {{first_name}}        — recipient first name
- {{company}}           — recipient company
- {{title}}             — recipient job title
- {{sender_first_name}} — sender first name (signature only; do not include a signature block in output)
- {{event_name}}, {{event_city}}, {{event_venue}} — use when referencing the event

OPTIONAL CUSTOM FIELDS (use if clearly relevant; each sentence containing one MUST read cleanly if the
field is empty — do not wrap the CTA around a custom field):
- {{peer_company}}    — one named peer your target knows (e.g. "Ramp", "Adyen")
- {{activity_signal}} — specific LinkedIn activity in the last 30 days
- {{session_name}}    — event agenda topic matching their priority

HARD RULES (violations are auto-rejected):
- Subject: all lowercase, max ${rules.subject_line_rules.max_word_count} words, no colons, no numbers, no buzzwords.
  Subject is static text only — do NOT put merge fields in the subject.
- Body: ${rules.email_body_targets.min_word_count}–${rules.email_body_targets.max_word_count} words, ${rules.email_body_targets.min_sentence_count}–${rules.email_body_targets.max_sentence_count} sentences.
- Structure: Personalization → Problem → Solution → CTA.
- No exclamation marks. No emoji. No em-dashes.
- You/Your must outnumber We/Our in the body.
- NEVER use these banned phrases or words: ${rules.banned_words_and_phrases.join(', ')}.
- NEVER use these subject buzzwords: ${rules.subject_line_rules.buzzwords_banned.join(', ')}.
- No event-niceties filler. No sharing-pleasantries. No sweeping-change verbs. No generic pleasantries.
- Do not begin with "I" or "My name is".
- Write specifically — name the event (literal string or {{event_name}}), name a priority or pain point.
- Address the recipient by {{first_name}} at least once; reference {{company}} at least once.
- Do NOT write [Name] / [Company] / <first_name> placeholders — use {{first_name}}, {{company}}, etc.

Preferred CTAs by reply-rate delta:
${rules.cta_type_ranking.map((c) => `  - ${c.type}: ${c.reply_rate_delta > 0 ? '+' : ''}${(c.reply_rate_delta * 100).toFixed(0)}%`).join('\n')}

Cold-outbound patterns (compressed):
${patterns.slice(0, 3000)}

Cold-outbound frameworks (compressed):
${frameworks.slice(0, 2000)}
`;
}

function buildUserPrompt(
  eventContext: EventContext,
  companyIcp: CompanyICP,
  persona: AttendeePersona,
  sequenceParams: SequenceParams,
  touchpoint: TimelineTouchpoint,
  brief: ReturnType<typeof touchBrief>,
  previousErrors: ValidationError[],
): string {
  const retryNote = previousErrors.length
    ? `\n\nPREVIOUS ATTEMPT FAILED these rules — fix them: ${previousErrors.map((e) => e.rule + ': ' + e.message).join(' | ')}`
    : '';
  return `Event: ${eventContext.name} (${eventContext.dates}, ${eventContext.location}).
Agenda: ${eventContext.agendaTitles.slice(0, 6).join('; ') || 'n/a'}.

Target persona: ${persona.role} (${persona.seniority}).
Priorities: ${persona.priorities.join('; ')}.
Pain points: ${persona.painPoints.join('; ')}.

Sender: ${sequenceParams.sendingIdentity.name}, ${sequenceParams.sendingIdentity.title} at ${sequenceParams.sendingIdentity.company}.

Touch: slot ${touchpoint.touch_slot}, channel ${touchpoint.channel}, offset ${touchpoint.offset_days}d (${brief.label}).
${brief.instruction}${retryNote}

Return a single touch as JSON matching the schema. Address the recipient with {{first_name}} and
reference their company as {{company}} — NEVER hard-code a specific company name or a specific named
persona cohort (like "VP Marketing peers at fintech scaleups"). Use {{title}} when you want to
reference their role. Write only the subject and body — no signature block, no greeting with "Hey".`;
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
  const coldOutboundPatterns = await getColdOutboundPatterns();
  const coldOutboundFrameworks = await getColdOutboundFrameworks();

  const systemPrompt = buildSystemPrompt(
    validationRules,
    coldOutboundPatterns,
    coldOutboundFrameworks,
  );

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
      const maxAttempts = 3;
      let previousErrors: ValidationError[] = [];
      let finalTouch: OutreachTouch | null = null;
      let lastLLMTouch: LLMTouch | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Temperature jitter across retries: 0.6, 0.85, 1.0.
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

        lastLLMTouch = llmTouch;

        const vr = validateTouch(
          {
            subject: llmTouch.subject,
            body: llmTouch.body,
            cta_type: llmTouch.cta_type,
            channel: touchpoint.channel,
          },
          eventContext,
          persona,
          validationRules,
        );

        const bannedFound = findBannedPhrases(
          `${llmTouch.subject} ${llmTouch.body}`,
          validationRules.banned_words_and_phrases,
        );
        const youVsWe = computeYouVsWeRatio(llmTouch.body);

        const builtTouch: OutreachTouch = {
          send_at_offset_days: touchpoint.offset_days,
          channel: touchpoint.channel,
          touch_type: brief.label,
          subject: llmTouch.subject,
          body: llmTouch.body,
          word_count: countWords(llmTouch.body),
          cta_type: llmTouch.cta_type,
          checks: {
            subjectWordCount: countWords(llmTouch.subject),
            allLowercase: llmTouch.subject === llmTouch.subject.toLowerCase(),
            bodyWordCount: countWords(llmTouch.body),
            bannedWordsFound: bannedFound,
            youVsWeRatio: Number.isFinite(youVsWe) ? youVsWe : youVsWe === Infinity ? 99 : 0,
          },
        };

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

      if (!finalTouch && lastLLMTouch) {
        // Defensive: should not happen, but keep the sequence contiguous.
        finalTouch = {
          send_at_offset_days: touchpoint.offset_days,
          channel: touchpoint.channel,
          touch_type: brief.label,
          subject: lastLLMTouch.subject,
          body: lastLLMTouch.body,
          word_count: countWords(lastLLMTouch.body),
          cta_type: lastLLMTouch.cta_type,
          checks: {
            subjectWordCount: countWords(lastLLMTouch.subject),
            allLowercase:
              lastLLMTouch.subject === lastLLMTouch.subject.toLowerCase(),
            bodyWordCount: countWords(lastLLMTouch.body),
            bannedWordsFound: [],
            youVsWeRatio: 0,
          },
          quality_flag: 'rules_violated',
        };
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
