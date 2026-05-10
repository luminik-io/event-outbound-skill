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
  getColdOutboundRules,
  findLlmCliches,
  ColdEmailBenchmarks,
  ColdOutboundRules,
  ChannelLengthRule,
  findPermissionToSendPhrasing,
  findForcedEventPhrasing,
  findSellerFirstPreviewPhrasing,
  findEventFirstPreviewPhrasing,
  findMissingMergeFields,
  findAssetPromisePhrasing,
  findProofClaimPhrasing,
} from '../lib/ruleService.js';
import { generateTimeline } from '../lib/timeline.js';

// ---------------------------------------------------------------------------
// Shape for a single touch returned by an injected generator.
// ---------------------------------------------------------------------------

type LLMTouch = {
  subject: string;
  body: string;
  cta_type: CTAType;
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function countWords(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0).length;
}

function countSentences(s: string): number {
  // Skip `.` followed by a digit (e.g. "1.4%") so decimal numbers do not
  // inflate sentence counts. Mirrors scripts/validate-touch.mjs.
  const matches = s.match(/[.!?]+(?!\d)/g);
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
// in cold-outbound-rules.json's channel_length_rules block.
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
    strictTruth?: boolean;
    apolloMergeFieldsRequired?: boolean;
    availableAssets?: string[];
    proofPoints?: string[];
  },
  eventContext: EventContext,
  persona: AttendeePersona,
  rules: ColdEmailBenchmarks,
  jbRules: ColdOutboundRules,
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

  // ---- Banned phrases (CEB + canon merged) -----------------------------------
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

  const permissionToSendHits = findPermissionToSendPhrasing(combined);
  if (permissionToSendHits.length > 0) {
    errors.push({
      rule: 'permissionToSendCta',
      message:
        'Body asks permission to send/share an asset or uses minutes as the CTA. Attach/link the useful thing and ask one real question instead.',
      offendingValue: permissionToSendHits.join(', '),
    });
  }

  const forcedEventPhrasingHits = findForcedEventPhrasing(
    combined,
    eventContext.name,
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
  const mergeSpec = jbRules.strict_context_rules?.apollo_merge_fields;
  const mergeApplies =
    touch.apolloMergeFieldsRequired === true ||
    (strictContext &&
      Boolean(mergeSpec?.applies_to?.includes(ruleKey)));
  const missingMergeFields = mergeApplies
    ? findMissingMergeFields(
        touch.body,
        mergeSpec?.required_fields ?? ['{{first_name}}', '{{company}}'],
      )
    : [];
  if (missingMergeFields.length > 0) {
    errors.push({
      rule: 'missingMergeFields',
      message: `Body must include Apollo-ready merge fields: ${missingMergeFields.join(', ')}.`,
      offendingValue: missingMergeFields.join(', '),
    });
  }

  const assetPromiseHits = findAssetPromisePhrasing(combined);
  if (
    strictContext &&
    assetPromiseHits.length > 0 &&
    (touch.availableAssets ?? []).length === 0
  ) {
    errors.push({
      rule: 'unsourcedAssetPromise',
      message:
        'Body promises or references an asset, but no availableAssets were supplied.',
      offendingValue: assetPromiseHits.join(', '),
    });
  }

  const proofClaimHits = findProofClaimPhrasing(combined);
  if (
    strictContext &&
    proofClaimHits.length > 0 &&
    (touch.proofPoints ?? []).length === 0
  ) {
    errors.push({
      rule: 'unsourcedProofClaim',
      message:
        'Body makes a customer, peer, or before/after proof claim, but no proofPoints were supplied.',
      offendingValue: proofClaimHits.join(', '),
    });
  }

  const previewSpec = jbRules.preview_line_rules;
  const previewApplies = Boolean(
    previewSpec?.applies_to?.includes(ruleKey),
  );
  const previewSellerHits = previewApplies
    ? findSellerFirstPreviewPhrasing(
        touch.body,
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
        touch.body,
        eventContext.name,
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

  // ---- LLM-cliche blocklist ----------------------------------------------
  // Catches phrases that mark text as LLM-generated even when the canon and
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
    permissionToSendHits,
    forcedEventPhrasingHits,
    missingMergeFields,
    assetPromiseHits,
    proofClaimHits,
    previewSellerHits,
    previewEventHits,
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

function buildSystemPrompt(rules: ColdEmailBenchmarks, jb: ColdOutboundRules): string {
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

  return `You are writing B2B outbound touches using the buyer-first 4T framework. Every line must read
aloud like a text from a smart peer noticing something specific, not a vendor blast. The bar: if the
recipient screenshots your copy, the comment should be "this person understands the work", not "another LLM blast".

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
4. **Talk?** - direct CTA, with a question mark. Lean-back energy, but no permission theatre.
   If you have a useful asset, attach or link it. Do not ask permission to send it. Approved closers:
     "Worth a look?" / "Worth a peek sometime?" / "Worth a skim?" / "Worth an exchange?"
     "Open to learning more?" / "Worth a conversation?" / "Worth coffee at {{event_name}}?"
   BANNED closers: "Do you have 15 minutes?", "Would you be open to a 30-minute call?",
   "Can we book time on your calendar?", "schedule a meeting", "Should I send it?",
   "Can I send it?", "Want me to send it?", "Want the one-pager?"

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
> {{first_name}}, noticed {{company}} is hiring SDRs, which suggests your team might be sending
> more cold email this quarter. How are you ensuring those emails do not land in spam? Google
> and Salesforce are using us to deliver 94% of cold emails to inboxes compared to 12% before.
> It involves a warm-up tool that raises inbox reputation. Open to a look?

Pass B - TitanX cold email (canonical LinkedIn 4T post):
> Subject: more at bats
>
> {{first_name}}, looks like {{company}} has SDRs cold calling Directors of Benefits and CHROs.
> How are you giving your reps more at bats? SDRs using TitanX have 6-8 conversations every
> 50 dials, compared to 1-2 before. We identify the people most likely to answer. Open to
> learning more?

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
STRICT TRUTH RULES (hard requirement)
==========================================================================================
- Do not invent assets. If available assets are empty, never mention "attached", "linked",
  "matrix", "brief", "worksheet", "one-pager", "report", "audit", "recap", "doc", or "map".
- Do not invent proof. If proof points are empty, never write named customers, "three orgs",
  "two teams", public-sounding before/after numbers, or peer benchmarks.
- If proof is missing, write a mechanism sentence or buyer-risk sentence instead. Better:
  ask for proof before drafting.
- If the event agenda or dates are unknown, do not imply a real session, track conflict,
  Tuesday slot, or day-of location.
- The event is only the occasion. The opener belongs to the buyer job, workaround, or hidden risk.

==========================================================================================
HARD VALIDATOR RULES (auto-rejected)
==========================================================================================
- Subject: all lowercase, max ${rules.subject_line_rules.max_word_count} words, no colons, no
  digits, no buzzwords. Subject is static text - do NOT put merge fields in the subject.
- Body length: per the channel table above.
- Body grammar: first letter of each sentence capitalized. Subject stays lowercase.
- Cold first touches and post-connect DMs: the first 18 words must be buyer-first. Do not put
  seller pronouns ("I", "we", "our", "us") or the event name at the front of the inbox preview.
- Cold emails AND post-connect DMs MUST contain a "how/what/why ARE/DO/IS you/your"
  illumination question. (Connection requests are exempt.)
- NO leading / moon-and-stars patterns: "if I could...", "would you be interested?",
  "wouldn't you agree?", "would you agree...", "don't you think..." - AUTO-REJECTED.
- NO permission-to-send CTAs. Auto-rejected: "should I send", "can I send",
  "want me to send/share/walk", "want the one-pager", "happy to send/share".
  Send or attach the asset, then ask a real question.
- NO forced event phrasing. Auto-rejected: "keeps coming up before RSA",
  "week of Money20/20", "today at RSA", "into m2020", and any illumination question
  that bolts "before [event]" onto the end. The event is the occasion, not the point.
- NO em-dashes (—). Use comma, period, or parentheses.
- NO exclamation marks. NO emoji.
- "you/your" must outnumber "we/our" in the body.
- Banned phrases (CEB + canon merged): ${rules.banned_words_and_phrases.slice(0, 30).join(', ')},
  plus ${jb.additional_banned_phrases.slice(0, 25).join(', ')}.
- Banned subject buzzwords: ${rules.subject_line_rules.buzzwords_banned.slice(0, 30).join(', ')}.
- Banned cold-email "fake-substantive" words: teardown, playbook (as marketing-deck word),
  blueprint, north star, north-star metric, table stakes, low-hanging fruit, double-click on,
  "do you have bandwidth". These read clever in vendor-deck contexts and pattern-match to
  mass outbound. Use the literal asset noun instead ("1-pager", "writeup", "recap", "case").
- NO LAZY GENERALIZATION OPENERS. Auto-rejected if the touch opens with "Most teams",
  "Most companies", "Most fintechs", "Most {{title}}s", "Most folks I talk to",
  "Many of you", "Almost nobody", "Nobody is", "Everyone is", "Every team", "In our experience"
  or any sibling generalization. These are population-shape statements that any vendor could
  send to any prospect. The Trigger step REQUIRES a specific observation about THIS recipient,
  THIS company, THIS event session, THIS hire, THIS funding round. If you do not have a
  specific anchor, reach for a situation trigger sized to the recipient's role
  ("end of Q3 and the CFO is locking the FY27 plan") before reaching for a generalization.
  Never open with "Most X..." even if the X is ICP-shaped.
- ONE problem per email. Don't mash multiple value props in one touch.
- Address {{first_name}} at least once; reference {{company}} at least once.
- Direct CTA from the approved list. ONE per touch.

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
// Generator boundary. Installed Claude plugin sessions use SKILL.md and
// scripts/validate-touch.mjs directly. The TypeScript API is only for headless
// callers that inject their own generator.
// ---------------------------------------------------------------------------

export type TouchGenerator = (args: {
  system: string;
  user: string;
  temperature: number;
}) => Promise<LLMTouch>;

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
  const jbRules = await getColdOutboundRules();
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
  const jbRules = await getColdOutboundRules();
  await getColdOutboundPatterns();
  await getColdOutboundFrameworks();

  const systemPrompt = buildSystemPrompt(validationRules, jbRules);

  if (!touchGenerator) {
    throw new Error(
      'generateSequence() requires an injected TouchGenerator outside an installed Claude plugin session. The installed skill uses the active Claude session plus the local validator; no external API key is required.',
    );
  }
  const llm = touchGenerator;

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
