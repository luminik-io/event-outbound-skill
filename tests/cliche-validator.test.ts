// Targeted unit tests for the LLM-cliche validator. Each test loads the
// canonical rules JSON and asserts that specific banned phrases trigger the
// expected hard-ban category. These complement evals/cold-outbound-evals.eval.ts
// (which runs canonical PASS/FAIL touches end-to-end).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';

import { findLlmCliches, type ColdOutboundRules } from '../src/lib/ruleService.js';

let rules: ColdOutboundRules;
let blocklist: NonNullable<ColdOutboundRules['llm_cliche_blocklist']>;

beforeAll(() => {
  const raw = readFileSync(
    join(process.cwd(), 'data', 'cold-outbound-rules.json'),
    'utf-8',
  );
  rules = JSON.parse(raw) as ColdOutboundRules;
  if (!rules.llm_cliche_blocklist) {
    throw new Error('Test fixture invariant: llm_cliche_blocklist missing from rules JSON');
  }
  blocklist = rules.llm_cliche_blocklist;
});

describe('findLlmCliches: lazy_generalization_openers (new in May 2026)', () => {
  it('flags a touch opening with "Most teams..."', () => {
    const text = 'Sarah, most teams treat events like a gamble. how are you measuring booth-to-pipeline?';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
    expect(result.hardBans.lazy_generalization_openers).toContain('most teams');
  });

  it('flags a touch with "Most VPs I talk to..."', () => {
    const text = 'Most VPs I talk to walk into RSA already knowing the rule-engine pitch.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
  });

  it('flags "Almost nobody" as a population-shape claim', () => {
    const text = 'Almost nobody tracks reply rate in the 14 days after a fintech conference.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
  });

  it('flags "Nobody is" as a universal-negative claim', () => {
    const text = 'Nobody is doing real-time attribution at events.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
  });

  it('flags "Everyone is" as a universal-positive claim', () => {
    const text = 'Everyone is talking about real-time payments at Money20/20.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
  });

  it('flags "In our experience" as self-positioning before observation', () => {
    const text = 'Hi Sarah, in our experience post-event motions are the gap.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
  });

  it('flags "Most fintechs" as ICP-shape generalization', () => {
    const text = 'Most fintechs burn 60% of their event budget on logistics.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
  });

  it('passes a recipient-specific opening that anchors on company name', () => {
    const text =
      "Sarah, the Money20/20 line item on Plaid's P&L is going to land in front of the CFO under the same last-touch, 90-day attribution rules your inbound runs on.";
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeUndefined();
  });

  it('passes a recipient-specific situation trigger', () => {
    const text =
      "Sarah, end of Q3 and the CFO is locking next year's plan. how are you sizing the false-positive bar at Plaid right now?";
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeUndefined();
  });

  it('flags templated funding-stage aggregation: "Three Series B fintechs we worked with..."', () => {
    const text =
      "Three Series B fintechs we worked with cut their false-positive bar 35% without dropping approval rates.";
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
  });

  it('flags "Two Series A SaaS we partnered with"', () => {
    const text =
      "Two Series A SaaS we partnered with hit 6x meeting velocity inside a quarter.";
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
  });

  it('flags "Series C cybersecurity" as templated proof', () => {
    const text =
      "A Series C cybersecurity team we helped raised post-event reply rates from 5% to 25%.";
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeDefined();
  });

  it('passes a named-customer third-party validation (the right shape)', () => {
    const text =
      "Stripe and Plaid lifted post-event reply rates from 5% to 25% inside 21 days using the same approach.";
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.lazy_generalization_openers).toBeUndefined();
  });
});

describe('findLlmCliches: cold_email_overused (existing)', () => {
  it('flags "teardown" as the asset-noun usage', () => {
    const text = 'Attached is a one-page teardown of how three demand-gen leads rebuilt attribution.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.cold_email_overused).toBeDefined();
    expect(result.hardBans.cold_email_overused).toContain('teardown');
  });

  it('flags "north star" as boardroom jargon', () => {
    const text = 'What is your north star metric for event-sourced pipeline?';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.cold_email_overused).toBeDefined();
  });

  it('flags "low-hanging fruit"', () => {
    const text = 'Booth scans are the low-hanging fruit of post-event attribution.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.cold_email_overused).toBeDefined();
  });

  it('flags "do you have bandwidth" as a hedge-question', () => {
    const text = 'Do you have bandwidth for a 15-minute walkthrough?';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.cold_email_overused).toBeDefined();
  });

  it('passes "recap" and "1-pager" as the approved replacements', () => {
    const text =
      'Attached is a 1-pager on how three demand-gen leads rebuilt the attribution window. Worth a recap before the show?';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.cold_email_overused).toBeUndefined();
  });
});

describe('findLlmCliches: existing categories still fire (regression coverage)', () => {
  it('flags "stuck with me" under performative_empathy', () => {
    const text = 'Pete, your post about cold email stuck with me. how are you screening for spam?';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.performative_empathy).toBeDefined();
  });

  it('flags "circling back" under sales_speak_openers', () => {
    const text = 'Just circling back on my note from last week.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.sales_speak_openers).toBeDefined();
  });

  it('flags "Moreover," under llm_transition_tics', () => {
    const text = 'Moreover, the data shows reply rates spike post-event.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.llm_transition_tics).toBeDefined();
  });

  it('flags "delve" under gpt_vocabulary', () => {
    const text = 'Let us delve into the post-event attribution problem.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.gpt_vocabulary).toBeDefined();
  });
});

describe('findLlmCliches: floor / vendor-shopper framing (new in May 2026)', () => {
  it('flags "Walking the floor" booth-canvasser opener', () => {
    const text =
      "Walking the floor last year I counted 14 vendors all pitching the same rule-engine story.";
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.cold_email_overused).toBeDefined();
  });

  it('flags "vendors all pitching the same"', () => {
    const text =
      'The exhibitor list this year has 47 fraud-platform vendors all pitching the same demo.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.cold_email_overused).toBeDefined();
  });

  it('flags "five vendors who" reciprocity-list framing', () => {
    const text =
      'I have a short list of the five vendors who showed up at last year RSA with real numbers.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.cold_email_overused).toBeDefined();
  });

  it('passes copy that grounds in the persona priority instead of the floor', () => {
    const text =
      'how are you keeping rule sets from going stale faster than the threat actor ROE evolves?';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.cold_email_overused).toBeUndefined();
  });
});

describe('additional_banned_phrases: anti-flex selling tics (new in May 2026)', () => {
  it('catches "no deck" as a soulless-selling tell', () => {
    expect(rules.additional_banned_phrases).toContain('no deck');
  });

  it('catches "no calendar invite" as a sales-coded reassurance', () => {
    expect(rules.additional_banned_phrases).toContain('no calendar invite');
  });

  it("catches \"reply yes and i'll send\" as a manufactured-friction CTA", () => {
    expect(rules.additional_banned_phrases).toContain("reply yes and i'll send");
  });

  it('catches "no commitment" as a permission-theatre tell', () => {
    expect(rules.additional_banned_phrases).toContain('no commitment');
  });
});
