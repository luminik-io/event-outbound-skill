/**
 * Source-grounded craft evals for event-outbound copy.
 *
 * This file intentionally avoids model-judged "sounds good" assertions.
 * The cases are hand-authored from the cold-outbound source corpus and encode
 * the craft bar as observable checks:
 *
 * - open with the buyer's world, not the seller's product
 * - show role fluency through concrete current-process language
 * - illuminate a costly, awkward problem the recipient may tolerate today
 * - ask a neutral "how/what" question instead of steering to a desired answer
 * - close with lean-back curiosity, not a meeting ask
 * - avoid invented proof, invented assets, and vendor self-praise
 *
 * Run: `npx vitest run evals/cold-outbound-craft-quality.eval.ts`
 */

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';

import { validateTouchExternal } from '../src/agents/sequencer.js';
import type { CTAType, EventContext, AttendeePersona } from '../src/types/index.js';

type CraftCase = {
  id: string;
  shouldPass: boolean;
  subject: string;
  body: string;
  availableAssets?: string[];
  proofPoints?: string[];
  expectedCraftFailures?: string[];
  note: string;
};

type CraftCheckResult = {
  id: string;
  pass: boolean;
  evidence: string;
};

const EVENT: EventContext = {
  name: 'Money20/20 Europe 2026',
  dates: 'June 2-4, 2026',
  startDate: '2026-06-02',
  endDate: '2026-06-04',
  location: 'Amsterdam',
  agendaTitles: ['instant payments', 'embedded finance', 'payments regulation'],
  speakers: [],
  exhibitorList: [],
};

const PAYMENTS_PERSONA: AttendeePersona = {
  personaId: 'head-of-payments',
  role: 'VP / Director / Head of Payments',
  seniority: 'executive',
  buyerJob:
    'reconcile instant-payment authentication, exception handling, and audit evidence before roadmap freeze',
  currentWorkaround:
    'rail-specific dashboards, spreadsheets, and Slack handoffs across payments ops, risk, and compliance',
  hiddenRisk:
    'nobody clearly owns the exception when SCA, funds flow, and audit evidence touch the same case',
  objections: ['we already have PSP dashboards'],
  priorities: [
    'instant-payment exception ownership',
    'audit evidence across rails',
    'SCA and step-up authentication',
    'Q3 roadmap freeze',
  ],
  painPoints: [
    'rail-specific dashboards',
    'manual Slack escalations',
    'spreadsheets for audit evidence',
    'SCA and funds-flow ownership ambiguity',
  ],
  exampleTitles: ['Head of Payments', 'VP Payments', 'Director of Payments'],
};

const CASES: CraftCase[] = [
  {
    id: 'gold_no_proof_no_asset',
    shouldPass: true,
    subject: 'exception ownership',
    body:
      '{{first_name}}, when instant-payment exceptions at {{company}} touch SCA, funds flow, and audit evidence at once, ownership can blur across risk, payments ops, and compliance. How are you deciding who closes the loop when a step-up decision changes the payment state? If that handoff stays split across PSP dashboards, spreadsheets, and Slack, the Q3 roadmap freeze can lock in a process nobody fully owns. Is this worth pressure-testing before Amsterdam?',
    note: 'Gold case: role-specific, no proof/assets, neutral question, cost of inaction, lean-back CTA.',
  },
  {
    id: 'gold_with_real_asset',
    shouldPass: true,
    subject: 'handoff checklist',
    availableAssets: ['approved instant-payment exception handoff checklist'],
    body:
      '{{first_name}}, a step-up exception at {{company}} can change the payment state while audit evidence lands in a different queue. How are you checking whether risk, ops, and compliance agree on ownership before roadmap freeze? Money20/20 Europe puts instant payments and regulation in the same room, so the timing is useful. I attached the approved handoff checklist for that review. Is this useful for the Amsterdam prep?',
    note: 'Gold case with a real supplied asset. Asset mention must be grounded in availableAssets.',
  },
  {
    id: 'clean_but_generic_vendor',
    shouldPass: false,
    subject: 'payment operations',
    body:
      '{{first_name}}, instant payments are on the Money20/20 Europe agenda, and payments leaders at {{company}} are looking for better ways to manage SCA, audit evidence, and payment operations across rails. How are you thinking about improving payment operations this quarter? Northstar Ledger helps teams simplify orchestration across FedNow and RTP. Is this worth a look before Amsterdam?',
    expectedCraftFailures: ['role_specificity', 'current_workaround', 'cost_of_inaction', 'seller_centered'],
    note: 'Looks clean, but it is generic vendor copy and does not poke a real pain.',
  },
  {
    id: 'wrong_buyer_job',
    shouldPass: false,
    subject: 'event attribution',
    body:
      '{{first_name}}, when {{company}} gets back from Money20/20 Europe, the booth leads usually land in the same campaign spreadsheet as webinar hand-raisers. How are you proving which event conversations sourced pipeline before the Q3 board deck? If that attribution stays fuzzy, marketing can lose budget even when the event worked. Is this worth looking at before Amsterdam?',
    expectedCraftFailures: ['role_specificity'],
    note: 'Good Luminik-style pain, wrong persona. A Head of Payments email should not become a marketing-attribution email.',
  },
  {
    id: 'pushy_sales_ask',
    shouldPass: false,
    subject: 'instant payments',
    body:
      '{{first_name}}, instant-payment exceptions at {{company}} can cross SCA, funds flow, and audit evidence at once. How are you deciding who owns the case when risk and ops both touch the same payment state? Northstar Ledger is the leading orchestration platform for regulated fintechs. Do you have thirty minutes next week for a demo?',
    expectedCraftFailures: ['lean_back_cta', 'seller_centered'],
    note: 'Understands the pain, then ruins trust with self-praise and a meeting-first ask.',
  },
  {
    id: 'invented_asset_and_proof',
    shouldPass: false,
    subject: 'exception ownership',
    body:
      '{{first_name}}, when instant-payment exceptions at {{company}} touch SCA, funds flow, and audit evidence at once, ownership can blur across risk, payments ops, and compliance. How are you deciding who closes the loop when a step-up decision changes the payment state? I attached the matrix from three payments teams that cut review time from five days to one. Is this useful before Amsterdam?',
    expectedCraftFailures: ['strict_truth'],
    note: 'Plausible but dishonest. No asset or proof was supplied.',
  },
  {
    id: 'too_many_problems',
    shouldPass: false,
    subject: 'payments roadmap',
    body:
      '{{first_name}}, Money20/20 Europe is a good moment for {{company}} to rethink instant payments, fraud operations, chargebacks, reconciliation, customer onboarding, PSP pricing, and compliance reporting. How are you prioritizing all of those before roadmap freeze? Northstar Ledger can help across the payment stack. Is this worth a look?',
    expectedCraftFailures: ['one_problem', 'current_workaround', 'seller_centered'],
    note: 'A list of concerns is not pain illumination. It makes the reader do the work.',
  },
  {
    id: 'leading_question',
    shouldPass: false,
    subject: 'exception ownership',
    body:
      '{{first_name}}, when instant-payment exceptions at {{company}} touch SCA, funds flow, and audit evidence at once, ownership can blur across risk, payments ops, and compliance. Would you agree that a single control layer would make those handoffs easier before roadmap freeze? Northstar Ledger gives teams that layer across FedNow, RTP, SEPA Instant, and cards. Worth a demo?',
    expectedCraftFailures: ['neutral_question', 'seller_centered', 'lean_back_cta'],
    note: 'The question steers to the seller-preferred answer instead of illuminating the buyer process.',
  },
];

function wordHits(text: string, patterns: RegExp[]): string[] {
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

function evaluateCraft(touch: CraftCase): CraftCheckResult[] {
  const text = `${touch.subject} ${touch.body}`;
  const lower = text.toLowerCase();
  const firstQuestion = touch.body.match(/[^.!?]*\?/)?.[0] ?? '';
  const roleSpecificHits = wordHits(lower, [
    /instant[- ]payment/,
    /\bsca\b/,
    /step[- ]up/,
    /funds[- ]flow/,
    /audit evidence/,
    /payments ops/,
    /\brisk\b/,
    /compliance/,
    /payment state/,
    /roadmap freeze/,
  ]);
  const currentWorkaroundHits = wordHits(lower, [
    /psp dashboard/,
    /rail[- ]specific dashboard/,
    /spreadsheet/,
    /\bslack\b/,
    /different queue/,
    /handoff/,
  ]);
  const costHits = wordHits(lower, [
    /lock in/,
    /nobody fully owns/,
    /ownership can blur/,
    /lands in a different queue/,
    /lose budget/,
    /fuzzy/,
    /before roadmap freeze/,
    /q3 roadmap freeze/,
  ]);
  const problemClusters = wordHits(lower, [
    /instant payments?/,
    /fraud/,
    /chargebacks?/,
    /reconciliation/,
    /onboarding/,
    /pricing/,
    /compliance reporting/,
    /event attribution/,
    /pipeline/,
    /booth leads?/,
  ]);
  const sellerCenteredHits = wordHits(lower, [
    /\bhelps?\b/,
    /\bplatform\b/,
    /\bleading\b/,
    /\bsolution\b/,
    /\bsimplify\b/,
    /\bcan help\b/,
    /\bgives teams\b/,
  ]);
  const meetingAskHits = wordHits(lower, [
    /\b\d+\s*(min|minute)/,
    /\bthirty minutes\b/,
    /\bdemo\b/,
    /\bbook\b/,
    /\bschedule\b/,
    /\bcalendar\b/,
  ]);
  const leanBackHits = wordHits(lower, [
    /is this worth/,
    /worth pressure-testing/,
    /is this useful/,
    /what does that look like/,
    /is this on/,
  ]);
  const neutralQuestion =
    /\b(how|what)\s+(are|do|is|can|could|would)\s+(you|your)\b/i.test(firstQuestion) &&
    !/\bwould you (agree|be interested|like|want)\b/i.test(firstQuestion) &&
    !/\bif (i|we) could\b/i.test(firstQuestion);

  return [
    {
      id: 'role_specificity',
      pass: roleSpecificHits.length >= 4 && !/booth leads?|pipeline|event attribution/.test(lower),
      evidence: `role-specific hits: ${roleSpecificHits.length}`,
    },
    {
      id: 'current_workaround',
      pass: currentWorkaroundHits.length >= 2,
      evidence: `current-workaround hits: ${currentWorkaroundHits.length}`,
    },
    {
      id: 'cost_of_inaction',
      pass: costHits.length >= 1,
      evidence: `cost-of-inaction hits: ${costHits.length}`,
    },
    {
      id: 'neutral_question',
      pass: neutralQuestion,
      evidence: firstQuestion || 'no question found',
    },
    {
      id: 'lean_back_cta',
      pass: leanBackHits.length >= 1 && meetingAskHits.length === 0,
      evidence: `lean-back hits: ${leanBackHits.length}, meeting asks: ${meetingAskHits.length}`,
    },
    {
      id: 'seller_centered',
      pass: sellerCenteredHits.length === 0,
      evidence: `seller-centered hits: ${sellerCenteredHits.length}`,
    },
    {
      id: 'one_problem',
      pass: problemClusters.length <= 4,
      evidence: `problem clusters: ${problemClusters.length}`,
    },
  ];
}

async function validateCase(touch: CraftCase) {
  return validateTouchExternal(
    {
      subject: touch.subject,
      body: touch.body,
      cta_type: 'ask_for_interest' as CTAType,
      channel: 'email',
      touch_type: 'cold_email_first_touch',
      strictTruth: true,
      apolloMergeFieldsRequired: true,
      availableAssets: touch.availableAssets,
      proofPoints: touch.proofPoints,
    },
    EVENT,
    PAYMENTS_PERSONA,
  );
}

describe('source-grounded cold-outbound craft quality', () => {
  it.each(CASES)('$id: $note', async (touch) => {
    const { result: validator } = await validateCase(touch);
    const craftChecks = evaluateCraft(touch);
    const failedCraftChecks = craftChecks.filter((check) => !check.pass).map((check) => check.id);
    const strictTruthFailed = validator.errors.some((error) =>
      ['unsourcedAssetPromise', 'unsourcedProofClaim', 'missingMergeFields'].includes(error.rule),
    );
    const allPassed = validator.isValid && failedCraftChecks.length === 0;

    if (touch.shouldPass) {
      expect(validator.errors, `${touch.id} validator errors`).toEqual([]);
      expect(failedCraftChecks, `${touch.id} craft failures`).toEqual([]);
      return;
    }

    expect(allPassed, `${touch.id} should not pass the full craft gate`).toBe(false);
    if (touch.expectedCraftFailures?.includes('strict_truth')) {
      expect(strictTruthFailed, `${touch.id} should fail strict truth`).toBe(true);
    }
    for (const expected of touch.expectedCraftFailures?.filter((id) => id !== 'strict_truth') ?? []) {
      expect(failedCraftChecks, `${touch.id} missing expected failure ${expected}`).toContain(
        expected,
      );
    }
  });

  it('fails clean-but-generic copy even when the basic validator passes', async () => {
    const generic = CASES.find((touch) => touch.id === 'clean_but_generic_vendor')!;
    const { result: validator } = await validateCase(generic);
    const failedCraftChecks = evaluateCraft(generic)
      .filter((check) => !check.pass)
      .map((check) => check.id);

    expect(validator.isValid).toBe(true);
    expect(failedCraftChecks).toEqual(
      expect.arrayContaining(['role_specificity', 'current_workaround', 'cost_of_inaction']),
    );
  });
});

describe('date-aware cadence as craft protection', () => {
  it('lets the skill infer event dates and today before drafting', () => {
    const output = execFileSync('node', ['scripts/plan-timeline.mjs'], {
      input: JSON.stringify({
        leadTimeWeeks: 4,
        channels: ['email'],
        touchCount: 6,
        minGapDays: 4,
        today: '2026-05-11',
        eventDates: 'June 2-4, 2026',
      }),
      encoding: 'utf8',
    });
    const parsed = JSON.parse(output);

    expect(parsed.isValid).toBe(true);
    expect(parsed.timeline.map((touch: { offset_days: number }) => touch.offset_days)).toEqual([
      -22,
      -16,
      -10,
      -4,
      0,
      4,
    ]);
  });

  it('asks for a cadence adjustment instead of squeezing too many touches together', () => {
    const output = execFileSync('node', ['scripts/plan-timeline.mjs'], {
      input: JSON.stringify({
        leadTimeWeeks: 1,
        channels: ['email'],
        touchCount: 6,
        minGapDays: 4,
        eventDates: 'June 2-4, 2026',
        today: '2026-05-26',
      }),
      encoding: 'utf8',
    });
    const parsed = JSON.parse(output);

    expect(parsed.isValid).toBe(false);
    expect(parsed.error).toMatch(/only 1 fit/);
  });
});
