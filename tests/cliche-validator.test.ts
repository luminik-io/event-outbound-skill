// Targeted unit tests for the LLM-cliche validator. Each test loads the
// canonical rules JSON and asserts that specific banned phrases trigger the
// expected hard-ban category. These complement evals/cold-outbound-evals.eval.ts
// (which runs canonical PASS/FAIL touches end-to-end).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';

import {
  findForcedEventPhrasing,
  findAssetPromisePhrasing,
  findEventFirstPreviewPhrasing,
  findLlmCliches,
  findMissingMergeFields,
  findPermissionToSendPhrasing,
  findProofClaimPhrasing,
  findSellerFirstPreviewPhrasing,
  type ColdOutboundRules,
} from '../src/lib/ruleService.js';

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

describe('preview-line validator: first 18 words (new in May 2026)', () => {
  it('catches seller-first preview copy with "I"', () => {
    const hits = findSellerFirstPreviewPhrasing(
      '{{first_name}}, I saw you are headed to Black Hat and wanted to share a worksheet.',
    );
    expect(hits).toContain('i');
  });

  it('catches seller-first preview copy with "we"', () => {
    const hits = findSellerFirstPreviewPhrasing(
      "{{first_name}}, we're helping security teams prepare for the next audit cycle.",
    );
    expect(hits).toContain('we');
  });

  it('catches event-first preview copy', () => {
    const hits = findEventFirstPreviewPhrasing(
      '{{first_name}}, Black Hat is coming up and I wanted to connect on detection rules.',
      'Black Hat USA 2026',
    );
    expect(hits.length).toBeGreaterThan(0);
  });

  it('passes buyer-responsibility-first preview copy with a natural event CTA later', () => {
    const sellerHits = findSellerFirstPreviewPhrasing(
      '{{first_name}}, rule ownership gets messy when the original writer moves teams and tier-1 keeps closing the same detection. Worth coffee at Black Hat?',
    );
    const eventHits = findEventFirstPreviewPhrasing(
      '{{first_name}}, rule ownership gets messy when the original writer moves teams and tier-1 keeps closing the same detection. Worth coffee at Black Hat?',
      'Black Hat USA 2026',
    );
    expect(sellerHits).toEqual([]);
    expect(eventHits).toEqual([]);
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

  it('flags generic post-event pleasantries under sales_speak_openers', () => {
    const text = '{{first_name}}, hope the week in Amsterdam went well.';
    const result = findLlmCliches(text, blocklist);
    expect(result.hardBans.sales_speak_openers).toContain('hope the week in');
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

describe('permission-to-send and direct-asset CTA validator', () => {
  it('catches "should I send" permission CTAs', () => {
    const hits = findPermissionToSendPhrasing('I wrote the checklist. Should I send it before the show?');
    expect(hits.length).toBeGreaterThan(0);
  });

  it('catches "can I send" permission CTAs', () => {
    const hits = findPermissionToSendPhrasing('Can I send the worksheet to your team?');
    expect(hits.length).toBeGreaterThan(0);
  });

  it('catches "want me to walk" permission CTAs', () => {
    const hits = findPermissionToSendPhrasing('Want me to walk your COO through the map?');
    expect(hits.length).toBeGreaterThan(0);
  });

  it('catches gated asset phrasing like "want the one-pager"', () => {
    const hits = findPermissionToSendPhrasing('A peer team cut alert volume 41%, want the one-pager?');
    expect(hits.length).toBeGreaterThan(0);
  });

  it('passes direct asset delivery with a real question', () => {
    const hits = findPermissionToSendPhrasing(
      'I attached the one-page worksheet we use for that review. Is this useful for {{company}} this quarter?',
    );
    expect(hits).toEqual([]);
  });
});

describe('strict-context validator helpers', () => {
  it('detects missing Apollo merge fields', () => {
    const missing = findMissingMergeFields(
      'Daniel, payment teams are reconciling PSD3 and FedNow on separate spreadsheets.',
    );
    expect(missing).toEqual(['{{first_name}}', '{{company}}']);
  });

  it('passes required Apollo merge fields', () => {
    const missing = findMissingMergeFields(
      '{{first_name}}, payment teams at {{company}} are reconciling PSD3 and FedNow on separate spreadsheets.',
    );
    expect(missing).toEqual([]);
  });

  it('detects promised assets that need a supplied availableAssets list', () => {
    const hits = findAssetPromisePhrasing(
      'I attached the PSD3 and FedNow matrix for the audit review.',
    );
    expect(hits.length).toBeGreaterThan(0);
  });

  it('does not treat normal asset nouns as invented asset promises', () => {
    const hits = findAssetPromisePhrasing(
      '{{first_name}}, when the audit timeline at {{company}} gets compressed, how are you deciding which control owners need the first look?',
    );
    expect(hits).toEqual([]);
  });

  it('detects invented peer proof claims that need supplied proofPoints', () => {
    const hits = findProofClaimPhrasing(
      'Three payments orgs cut false positives from 18% to 9% using the same review.',
    );
    expect(hits.length).toBeGreaterThan(0);
  });

  it('does not treat "using your API to" as a proof claim', () => {
    const hits = findProofClaimPhrasing(
      '{{first_name}}, how are your customers using your API to reconcile FedNow exceptions when SCA rules disagree?',
    );
    expect(hits).toEqual([]);
  });
});

describe('forced event phrasing validator', () => {
  it('catches "keeps coming up before RSA"', () => {
    const hits = findForcedEventPhrasing(
      'The alert-fatigue blast radius keeps coming up before RSA.',
      'RSA Conference 2026',
    );
    expect(hits.length).toBeGreaterThan(0);
  });

  it('catches "week of Money20/20"', () => {
    const hits = findForcedEventPhrasing(
      '{{first_name}}, week of Money20/20. How are you holding false positives?',
      'Money20/20 Europe 2026',
    );
    expect(hits.length).toBeGreaterThan(0);
  });

  it('catches vague shorthand like m2020', () => {
    const hits = findForcedEventPhrasing('Worth a conversation before m2020?', 'Money20/20 Europe 2026');
    expect(hits.length).toBeGreaterThan(0);
  });

  it('catches CTAs that use the event location as the buyer reason', () => {
    const hits = findForcedEventPhrasing(
      'How are you deciding who owns the payment exception? Is this worth pressure-testing before Amsterdam?',
      'Money20/20 Europe 2026',
      'Amsterdam',
    );
    expect(hits.length).toBeGreaterThan(0);
  });

  it('catches event prep CTAs that sound detached from the buyer job', () => {
    const hits = findForcedEventPhrasing(
      'I attached the handoff checklist. Is this useful for the Amsterdam prep?',
      'Money20/20 Europe 2026',
      'Amsterdam, Netherlands',
    );
    expect(hits.length).toBeGreaterThan(0);
  });

  it('passes a buyer-timing CTA that is not using the city as the reason', () => {
    const hits = findForcedEventPhrasing(
      'How are you deciding who owns the payment exception? Is this worth looking into before roadmap freeze?',
      'Money20/20 Europe 2026',
      'Amsterdam',
    );
    expect(hits).toEqual([]);
  });

  it('passes a natural event CTA after buyer context', () => {
    const hits = findForcedEventPhrasing(
      'How are you deciding who owns the answer at {{company}}? I attached the worksheet. Worth talking through over coffee at RSA?',
      'RSA Conference 2026',
    );
    expect(hits).toEqual([]);
  });
});

describe('additional_banned_phrases: forced-personalization + slang tells (new in May 2026)', () => {
  it('catches "caught my eye" as a fabricated-signal tell', () => {
    expect(rules.additional_banned_phrases).toContain('caught my eye');
  });

  it('catches "caught my attention" as the same fabricated-signal tell', () => {
    expect(rules.additional_banned_phrases).toContain('caught my attention');
  });

  it('catches "wall-to-wall" as faux-casual slang', () => {
    expect(rules.additional_banned_phrases).toContain('wall-to-wall');
  });

  it('catches "no worries" as a sales-coded soft-out', () => {
    expect(rules.additional_banned_phrases).toContain('no worries');
  });

  it('catches "fire drill" as office-slang theatre', () => {
    expect(rules.additional_banned_phrases).toContain('fire drill');
  });

  it('catches "comparing notes" as an over-deployed cold-email close', () => {
    expect(rules.additional_banned_phrases).toContain('comparing notes');
  });

  it('catches "compare notes" as the same over-deployed close', () => {
    expect(rules.additional_banned_phrases).toContain('compare notes');
  });

  it('catches "would you be open to" as a leading question', () => {
    expect(rules.additional_banned_phrases).toContain('would you be open to');
  });

  it('catches "if I told you" as a moon-and-stars opener', () => {
    expect(rules.additional_banned_phrases).toContain('if i told you');
  });

  it('catches "quick intro call" as a meeting-first CTA', () => {
    expect(rules.additional_banned_phrases).toContain('quick intro call');
  });
});
