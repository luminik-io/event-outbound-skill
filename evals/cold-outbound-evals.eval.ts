/**
 * the cold-outbound canon framework evals.
 *
 * Two layers:
 *   1. **Validator-only evals** — run all 8 canonical FAIL examples through the
 *      hard validator and assert at least one rule fires. No LLM required.
 *      These also verify the 10 canonical PASS examples don't trip false
 *      positives on the rules they're supposed to demonstrate.
 *   2. **External-judge evals** — for each canonical PASS, ask a pluggable
 *      `TouchJudge` whether the touch satisfies a 4T criterion. Skipped in CI.
 *      Our own eval harness can inject any model adapter outside the public
 *      plugin install path.
 *
 * Run: `npx vitest run evals/`
 *
 * Reference: data/cold-outbound-craft.md "Encoding plan §3" lists the 7 evals.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { validateTouchExternal } from '../src/agents/sequencer.js';
import type { CTAType, EventContext, AttendeePersona } from '../src/types/index.js';

// ---------------------------------------------------------------------------
// Canonical examples loader
// ---------------------------------------------------------------------------

type CanonicalTouch = {
  id: string;
  channel: 'email' | 'linkedin';
  touch_type: string;
  subject: string;
  body: string;
  source: string;
  annotation?: string;
  expected_failures?: string[];
};

type CanonicalExamples = {
  pass_examples: CanonicalTouch[];
  fail_examples: CanonicalTouch[];
};

const examples: CanonicalExamples = JSON.parse(
  readFileSync(
    join(process.cwd(), 'data', 'cold-outbound-canonical-examples.json'),
    'utf-8',
  ),
);

// ---------------------------------------------------------------------------
// Test fixtures (event + persona) — generic enough that all canonical examples
// fit. Specificity-token check uses these.
// ---------------------------------------------------------------------------

const FIXTURE_EVENT: EventContext = {
  name: 'Conference 2026',
  dates: 'May 1-3, 2026',
  location: 'San Francisco, CA',
  agendaTitles: ['cold email deliverability', 'commission ops', 'subscription management', 'identity verification'],
  speakers: [],
  exhibitorList: [],
};

const FIXTURE_PERSONA: AttendeePersona = {
  personaId: 'fixture',
  role: 'VP Sales',
  seniority: 'executive',
  priorities: ['cold email deliverability', 'subscriptions', 'sdrs hiring', 'commissions', 'cord-cutters'],
  painPoints: [
    'spam folder placement',
    'overpaying subscriptions',
    'florida tax law',
    'commission errors',
    'mfa rollout',
    'identity verification',
    'self-employed',
    'soc2 compliance',
    'sdrs cold calling',
  ],
  exampleTitles: ['VP of Sales'],
};

// ---------------------------------------------------------------------------
// Pluggable LLM judge (so tests can mock with golden answers).
// ---------------------------------------------------------------------------

export type JudgeVerdict = {
  pass: boolean;
  score: number; // 0-5
  reasoning: string;
};

export type TouchJudge = (args: {
  touch: CanonicalTouch;
  criterion: string;
  rubric: string;
}) => Promise<JudgeVerdict>;

export function makeExternalJudge(judge?: TouchJudge): TouchJudge {
  if (!judge) {
    throw new Error(
      'External LLM judge is not bundled with the public skill. Inject a TouchJudge from your private eval harness.',
    );
  }
  return judge;
}

const judgeAvailable = false;

// ---------------------------------------------------------------------------
// Eval 1: 4T structure (LLM-judge, skipped in CI without key)
// ---------------------------------------------------------------------------

describe('Eval 1: 4T structure scoring', () => {
  const coldEmailPasses = examples.pass_examples.filter(
    (e) => e.touch_type === 'email_cold',
  );

  it.skipIf(!judgeAvailable)(
    'every canonical PASS cold email scores >=3 on each of the 4 Ts',
    async () => {
      const judge = makeExternalJudge();
      for (const ex of coldEmailPasses) {
        for (const T of ['Trigger', 'Think', 'Third-party', 'Talk?']) {
          const v = await judge({
            touch: ex,
            criterion: `Does this email contain a clear "${T}" component per the cold-outbound 4T framework?`,
            rubric:
              T === 'Trigger'
                ? 'A specific observation about the prospect (looks like / noticed / seems like) that ladders to the problem.'
                : T === 'Think'
                  ? 'A neutral how/what/why-are-you illumination question — NOT a leading "would you..." or "if I could..." question.'
                  : T === 'Third-party'
                    ? 'A peer/customer + contrast number sentence. Not self-praise.'
                    : 'A lean-back interest-based CTA ending in a question mark. Not a meeting ask.',
          });
          expect(v.score, `${ex.id} ${T}: ${v.reasoning}`).toBeGreaterThanOrEqual(3);
        }
      }
    },
    300_000,
  );
});

// ---------------------------------------------------------------------------
// Eval 2: Trigger-Think coherence (LLM-judge)
// ---------------------------------------------------------------------------

describe('Eval 2: Trigger-Think coherence', () => {
  it.skipIf(!judgeAvailable)(
    'PASS examples have Trigger and Think that ladder together; FAIL examples do not',
    async () => {
      const judge = makeExternalJudge();
      const irrelevantTrigger = examples.fail_examples.find(
        (e) => e.id === 'irrelevant_trigger',
      )!;
      const v = await judge({
        touch: irrelevantTrigger,
        criterion: 'Do the Trigger sentence and the Think question elegantly tie together?',
        rubric: 'PASS only if the trigger context is the same domain as the question. Florida State + cold-email deliverability = FAIL.',
      });
      expect(v.pass, `irrelevant_trigger should fail: ${v.reasoning}`).toBe(false);
    },
    120_000,
  );
});

// ---------------------------------------------------------------------------
// Eval 3: Question neutrality (LLM-judge)
// ---------------------------------------------------------------------------

describe('Eval 3: Question neutrality', () => {
  it.skipIf(!judgeAvailable)(
    'leading_question_yesno fails neutrality; canonical Warmbox passes',
    async () => {
      const judge = makeExternalJudge();
      const leading = examples.fail_examples.find(
        (e) => e.id === 'leading_question_yesno',
      )!;
      const warmbox = examples.pass_examples.find(
        (e) => e.id === 'warmbox_cold_first_touch',
      )!;
      const vLead = await judge({
        touch: leading,
        criterion: 'Is the Think question genuinely neutral?',
        rubric: 'A neutral question does not betray the seller\'s preferred answer. "Would you agree X is critical?" is leading. "How are you ensuring X?" is neutral.',
      });
      const vWarm = await judge({
        touch: warmbox,
        criterion: 'Is the Think question genuinely neutral?',
        rubric: 'A neutral question does not betray the seller\'s preferred answer.',
      });
      expect(vLead.pass).toBe(false);
      expect(vWarm.pass).toBe(true);
    },
    120_000,
  );
});

// ---------------------------------------------------------------------------
// Eval 4: Voice authenticity (LLM-judge)
// ---------------------------------------------------------------------------

describe('Eval 4: Voice authenticity vs canonical', () => {
  it.skipIf(!judgeAvailable)(
    'each PASS cold-email scores >=3 for buyer-first voice authenticity',
    async () => {
      const judge = makeExternalJudge();
      const coldEmailPasses = examples.pass_examples.filter(
        (e) => e.touch_type === 'email_cold',
      );
      const titanx = examples.pass_examples.find((e) => e.id === 'titanx_cold_first_touch')!;
      for (const ex of coldEmailPasses) {
        const v = await judge({
          touch: ex,
          criterion: 'Does this email read in the cold-outbound canon\'s voice?',
          rubric: `Reference: TitanX example by the canon's author: "${titanx.body}". Score 0-5: short sentences, contrast pivots, lean-back CTA, no buzzwords, no self-praise.`,
        });
        expect(v.score, `${ex.id}: ${v.reasoning}`).toBeGreaterThanOrEqual(3);
      }
    },
    300_000,
  );
});

// ---------------------------------------------------------------------------
// Eval 5: Lean-back CTA (validator-friendly)
// ---------------------------------------------------------------------------

describe('Eval 5: Lean-back CTA', () => {
  it('every cold-email PASS ends in a lean-back question, not a meeting ask', () => {
    const leanBackPatterns = [
      /worth (a|the|an) /i,
      /open to /i,
      /want (a|to) (try|see|peek)/i,
      /think this might help/i,
    ];
    const meetingAskPatterns = [
      /\b(15|30) (minute|min)/i,
      /book (a |time)/i,
      /schedule a (meeting|call|chat)/i,
      /calendar/i,
    ];
    for (const ex of examples.pass_examples) {
      if (ex.touch_type !== 'email_cold') continue;
      const hasLeanBack = leanBackPatterns.some((r) => r.test(ex.body));
      const hasMeetingAsk = meetingAskPatterns.some((r) => r.test(ex.body));
      expect(hasLeanBack, `${ex.id} should have a lean-back CTA`).toBe(true);
      expect(hasMeetingAsk, `${ex.id} should NOT have a meeting ask`).toBe(false);
    }
    // pitchy_cta FAIL example must trip the meeting-ask detection.
    const pitchy = examples.fail_examples.find((e) => e.id === 'pitchy_cta')!;
    expect(meetingAskPatterns.some((r) => r.test(pitchy.body))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Eval 6: One problem per email (LLM-judge)
// ---------------------------------------------------------------------------

describe('Eval 6: One-problem-per-email', () => {
  it.skipIf(!judgeAvailable)(
    'multi_problem_mash FAIL is flagged; canonical PASS is not',
    async () => {
      const judge = makeExternalJudge();
      const multi = examples.fail_examples.find((e) => e.id === 'multi_problem_mash')!;
      const captivate = examples.pass_examples.find(
        (e) => e.id === 'captivateiq_cold_first_touch',
      )!;
      const vMulti = await judge({
        touch: multi,
        criterion: 'Does this email focus on exactly ONE problem?',
        rubric: 'Rule: isolate one problem per email. Mashing 2+ problems = fail.',
      });
      const vGood = await judge({
        touch: captivate,
        criterion: 'Does this email focus on exactly ONE problem?',
        rubric: 'Rule: isolate one problem per email.',
      });
      expect(vMulti.pass).toBe(false);
      expect(vGood.pass).toBe(true);
    },
    120_000,
  );
});

// ---------------------------------------------------------------------------
// Eval 7: Anti-pattern detection (validator-only — no LLM needed)
// ---------------------------------------------------------------------------

describe('Eval 7: Anti-pattern detection (validator)', () => {
  it('all 8 canonical FAIL examples are flagged by at least one validator rule', async () => {
    const flagged: string[] = [];
    const passed: string[] = [];
    for (const ex of examples.fail_examples) {
      const { result } = await validateTouchExternal(
        {
          subject: ex.subject,
          body: ex.body,
          cta_type: 'make_offer' as CTAType,
          channel: ex.channel,
          touch_type: ex.touch_type,
        },
        FIXTURE_EVENT,
        FIXTURE_PERSONA,
      );
      if (result.errors.length > 0) flagged.push(ex.id);
      else passed.push(ex.id);
    }
    expect(passed, `These FAIL examples slipped through: ${passed.join(', ')}`).toEqual([]);
    expect(flagged.length).toBe(examples.fail_examples.length);
  });

  it('moon_and_stars trips at least three distinct rule categories', async () => {
    const moon = examples.fail_examples.find((e) => e.id === 'moon_and_stars')!;
    const { result } = await validateTouchExternal(
      {
        subject: moon.subject,
        body: moon.body,
        cta_type: 'make_offer' as CTAType,
        channel: moon.channel,
        touch_type: moon.touch_type,
      },
      FIXTURE_EVENT,
      FIXTURE_PERSONA,
    );
    const ruleSet = new Set(result.errors.map((e) => e.rule));
    expect(ruleSet.size).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// Bonus: PASS examples don't false-positive on length / structure
// ---------------------------------------------------------------------------

describe('Bonus: canonical PASS examples shouldn\'t trip critical validators', () => {
  it('every PASS example has the right body word count for its touch_type', async () => {
    // We don't assert zero validator errors — the canonical examples were
    // written before the merge-field requirement, so {{first_name}}/{{company}}
    // checks would fire. We only assert length + structural rules.
    const lengthRules: Record<string, [number, number]> = {
      email_cold: [50, 100],
      linkedin_connection_request: [18, 35],
      linkedin_dm_post_connect: [50, 120],
      linkedin_day_of_nudge: [30, 60],
      post_event_followup: [40, 90],
    };
    for (const ex of examples.pass_examples) {
      const range = lengthRules[ex.touch_type];
      if (!range) continue;
      const wc = ex.body.split(/\s+/).filter(Boolean).length;
      expect(wc, `${ex.id}: ${wc} words, expected ${range[0]}-${range[1]}`).toBeGreaterThanOrEqual(range[0]);
      expect(wc, `${ex.id}: ${wc} words, expected ${range[0]}-${range[1]}`).toBeLessThanOrEqual(range[1]);
    }
  });

  it('every cold-email PASS (with one labeling-pattern exception) contains an illumination question', () => {
    const iqRegex = /\b(how|what|why)\s+(are|do|is|can|could|would|should|did)\s+(you|your)\b/i;
    // Note: solopreneur_tax uses the canon's "presupposition + label" variant, not a how/what/why
    // question (synthesis doc Pass #5). It's intentionally a different pattern in the canon's
    // material so we don't enforce the IQ regex on it.
    const labelingPatternIds = new Set(['solopreneur_tax_cold_first_touch']);
    for (const ex of examples.pass_examples) {
      if (ex.touch_type !== 'email_cold') continue;
      if (labelingPatternIds.has(ex.id)) continue;
      expect(iqRegex.test(ex.body), `${ex.id} should have an illumination question`).toBe(true);
    }
  });
});
