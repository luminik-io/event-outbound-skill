import { expect, test } from 'vitest';
import { spawnSync } from 'node:child_process';
import { EventContext } from '../src/types/index.js';

test('EventContext type exists', () => {
  const context: EventContext = {
    name: 'Test Event',
    dates: 'Jan 1-2',
    location: 'Online',
    agendaTitles: [],
    speakers: [],
    exhibitorList: [],
  };
  expect(context).toBeDefined();
});

test('validate-touch CLI rejects digits in subject lines', () => {
  const payload = {
    subject: 'q4 roi',
    body: '{{first_name}}, when stale detection rules keep tier-1 closing the same alert, the audit answer gets harder to defend. How are you deciding who owns stale rules at {{company}} this quarter? I attached the worksheet. Worth a coffee at Black Hat if this is on your audit list?',
    channel: 'email',
    touch_type: 'cold_email_first_touch',
    eventName: 'Black Hat USA 2026',
    personaPriorities: ['own audit-ready detection rules'],
    personaPainPoints: ['stale rules keep tier-1 closing the same detection'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('subjectNumbers');
});

test('validate-touch CLI strict mode rejects invented assets and proof', () => {
  const payload = {
    subject: 'fednow auth',
    body: '{{first_name}}, PSD3 exceptions and FedNow authentication fields can land in two separate workstreams at {{company}}. How are you deciding which rule owns the step-up moment when instant-payment risk and SCA exemptions disagree? I attached the matrix from three payments teams that cut review time from five days to one day. Worth a look?',
    channel: 'email',
    touch_type: 'cold_email_first_touch',
    eventName: 'Identiverse 2026',
    personaPriorities: ['own PSD3 and FedNow authentication compliance'],
    personaPainPoints: ['instant-payment risk and SCA exemptions disagree'],
    strictTruth: true,
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  const rules = parsed.errors.map((e: { rule: string }) => e.rule);
  expect(rules).toContain('unsourcedAssetPromise');
  expect(rules).toContain('unsourcedProofClaim');
});

test('validate-touch CLI strict mode accepts sourced assets and proof', () => {
  const payload = {
    subject: 'fednow auth',
    body: '{{first_name}}, PSD3 exceptions and FedNow authentication fields can land in two separate workstreams at {{company}}. How are you deciding which rule owns the step-up moment when instant-payment risk and SCA exemptions disagree? I attached the approved field matrix from the April customer interview batch. Worth a look?',
    channel: 'email',
    touch_type: 'cold_email_first_touch',
    eventName: 'Identiverse 2026',
    personaPriorities: ['own PSD3 and FedNow authentication compliance'],
    personaPainPoints: ['instant-payment risk and SCA exemptions disagree'],
    strictTruth: true,
    availableAssets: ['approved field matrix from the April customer interview batch'],
    proofPoints: ['April customer interview batch'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).not.toContain(
    'unsourcedAssetPromise',
  );
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).not.toContain(
    'unsourcedProofClaim',
  );
});

test('validate-touch CLI rejects CTAs that use the event city as the buyer reason', () => {
  const payload = {
    subject: 'exception ownership',
    body: '{{first_name}}, when instant-payment exceptions at {{company}} touch SCA, funds flow, and audit evidence at once, ownership can blur across risk and payments ops. How are you deciding who closes the loop when a step-up decision changes the payment state? Is this worth pressure-testing before Amsterdam?',
    channel: 'email',
    touch_type: 'cold_email_first_touch',
    eventName: 'Money20/20 Europe 2026',
    eventLocation: 'Amsterdam',
    personaPriorities: ['instant-payment exception ownership'],
    personaPainPoints: ['ownership can blur across risk and payments ops'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain(
    'forcedEventPhrasing',
  );
});

test('validate-touch CLI rejects invented sender logistics', () => {
  const payload = {
    subject: 'amsterdam coffee',
    body: '{{first_name}}, if the instant-rail exception ownership question is still open for {{company}}, the audit trail can stay split across risk, product, and payments ops. I am around the auth and operations side of the agenda today. Worth a coffee between sessions?',
    channel: 'email',
    touch_type: 'cold_email_followup_3plus',
    eventName: 'Money20/20 Europe 2026',
    eventLocation: 'Amsterdam',
    personaPriorities: ['instant-payment exception ownership'],
    personaPainPoints: ['audit trail can stay split across risk, product, and payments ops'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('bannedWords');
  expect(parsed.checks.bannedWordsFound).toEqual(
    expect.arrayContaining(['i am around', 'side of the agenda']),
  );
});

test('validate-touch CLI rejects recycled pain angles within a sequence', () => {
  const payload = {
    subject: 'exception routing',
    body: '{{first_name}}, exception routing at {{company}} still breaks when the auth log and rail trace sit with different owners. Where is your exception owner landing this quarter?',
    channel: 'email',
    touch_type: 'cold_email_followup_3plus',
    eventName: 'Money20/20 Europe 2026',
    personaPriorities: ['instant-payment exception ownership'],
    personaPainPoints: ['exception ownership split across auth and rail funds trace'],
    strictAngleDiversity: true,
    painAngle: {
      label: 'exception ownership',
      sourcePain: 'exception ownership split across auth and rail funds trace',
      mechanism: 'auth log and rail trace sit with different owners',
      costOfInaction: 'roadmap owner remains unclear',
    },
    usedPainAngles: [
      {
        label: 'exception ownership',
        sourcePain: 'exception ownership split across auth and rail funds trace',
      },
    ],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('painAngleReused');
});

test('validate-touch CLI rejects sequence-mechanics openers', () => {
  const payload = {
    subject: 'evidence pack',
    body: '{{first_name}}, separate thread from my earlier note: audit evidence at {{company}} can become a scavenger hunt when auth logs and rail traces live in different systems. How are you reconstructing why the payment moved after authentication changed? Worth a closer look?',
    channel: 'email',
    touch_type: 'cold_email_followup_2',
    eventName: 'Money20/20 Europe 2026',
    personaPriorities: ['audit-ready payment authentication evidence'],
    personaPainPoints: ['audit evidence scattered across auth logs and rail traces'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('bannedWords');
  expect(parsed.checks.bannedWordsFound).toEqual(
    expect.arrayContaining(['separate thread', 'earlier note', 'my earlier note']),
  );
});

test('validate-touch CLI rejects vague calendar-trigger openers', () => {
  const payload = {
    subject: 'roadmap queue',
    body: '{{first_name}}, this is usually the week new rails get attention, but the roadmap queue at {{company}} may still treat auth-and-payments cleanup as ops work. Where is that sitting on your side now: a Q3 product item, a risk cleanup, or something nobody owns yet?',
    channel: 'email',
    touch_type: 'cold_email_followup_3plus',
    eventName: 'Money20/20 Europe 2026',
    personaPriorities: ['payment-auth roadmap ownership'],
    personaPainPoints: ['payment-auth cleanup can be misclassified as ops work'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('bannedWords');
  expect(parsed.checks.bannedWordsFound).toEqual(
    expect.arrayContaining(['this is usually the week', 'new rails get attention']),
  );
});

test('validate-touch CLI rejects invented event logistics', () => {
  const payload = {
    subject: 'drift review',
    body: "{{first_name}}, model-drift reviews get painful when someone runs the query every two weeks and chargebacks have already shipped. How are you catching drift in real time at {{company}} before next year's loss-budget locks? I am hosting four risk leads Tuesday afternoon on this. Worth a seat?",
    channel: 'linkedin',
    touch_type: 'linkedin_dm_post_connect',
    eventName: 'Money20/20 Europe 2026',
    personaPriorities: ['same-day fraud model drift review'],
    personaPainPoints: ['manual model-drift detection ships two weeks of chargebacks'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('bannedWords');
  expect(parsed.checks.bannedWordsFound).toEqual(expect.arrayContaining(['i am hosting']));
});

test('validate-touch CLI rejects invented buyer state', () => {
  const payload = {
    subject: 'soc2 evidence',
    body: '{{first_name}}, the Black Hat sessions map closely to the breach-readiness gap your auditor flagged at {{company}}. How are you deciding which takeaway becomes evidence for the next SOC2 review? Does this belong in the roadmap conversation?',
    channel: 'linkedin',
    touch_type: 'linkedin_day_of_nudge',
    eventName: 'Black Hat USA 2026',
    personaPriorities: ['SOC2 evidence readiness'],
    personaPainPoints: ['audit evidence scattered across tools'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('bannedWords');
  expect(parsed.checks.bannedWordsFound).toEqual(
    expect.arrayContaining(['your auditor flagged']),
  );
});

test('validate-touch CLI rejects LinkedIn connection requests without a clear connection CTA', () => {
  const payload = {
    subject: '',
    body: '{{first_name}}, rule ownership after the original writer moves teams creates the SOC2 evidence gap for your team at {{company}}, and Black Hat seems relevant.',
    channel: 'linkedin',
    touch_type: 'linkedin_connection_request',
    eventName: 'Black Hat USA 2026',
    personaPriorities: ['SOC2 evidence readiness'],
    personaPainPoints: ['detection rule ownership creates SOC2 evidence gaps'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('clearCta');
  expect(parsed.checks.missingClearCta).toBe(true);
});

test('validate-touch CLI accepts LinkedIn connection requests with an explicit connection CTA', () => {
  const payload = {
    subject: '',
    body: '{{first_name}}, rule ownership after the original writer moves teams creates the SOC2 evidence gap for your team at {{company}}, and Black Hat seems relevant. Open to connecting?',
    channel: 'linkedin',
    touch_type: 'linkedin_connection_request',
    eventName: 'Black Hat USA 2026',
    personaPriorities: ['SOC2 evidence readiness'],
    personaPainPoints: ['detection rule ownership creates SOC2 evidence gaps'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(true);
  expect(parsed.checks.clearCtaHits.length).toBeGreaterThan(0);
});

test('validate-touch CLI rejects LinkedIn DMs that end without a lean-back CTA', () => {
  const payload = {
    subject: '',
    body: "{{first_name}}, model-drift reviews get painful when someone runs the query every two weeks and chargebacks have already shipped. How are you catching drift in real time at {{company}} before next year's loss-budget locks? The hard part is knowing whether the Q4 target is a model problem, a rules problem, or a reporting problem.",
    channel: 'linkedin',
    touch_type: 'linkedin_dm_post_connect',
    eventName: 'Money20/20 Europe 2026',
    personaPriorities: ['same-day fraud model drift review'],
    personaPainPoints: ['manual model-drift detection ships two weeks of chargebacks'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('clearCta');
});

test('validate-touch CLI accepts LinkedIn DMs with a clear lean-back CTA', () => {
  const payload = {
    subject: '',
    body: "{{first_name}}, model-drift reviews get painful when someone runs the query every two weeks and chargebacks have already shipped. How are you catching drift in real time at {{company}} before next year's loss-budget locks? The hard part is knowing whether the Q4 target is a model problem, a rules problem, or a reporting problem. Worth looking into?",
    channel: 'linkedin',
    touch_type: 'linkedin_dm_post_connect',
    eventName: 'Money20/20 Europe 2026',
    personaPriorities: ['same-day fraud model drift review'],
    personaPainPoints: ['manual model-drift detection ships two weeks of chargebacks'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(true);
  expect(parsed.checks.clearCtaHits).toEqual(expect.arrayContaining(['Worth looking into?']));
});

test('validate-touch CLI rejects email touches that end on an asset statement without a CTA', () => {
  const payload = {
    subject: 'drift review',
    body: "{{first_name}}, model-drift reviews get painful when someone runs the query every two weeks and chargebacks have already shipped. How are you catching drift in real time at {{company}} before next year's loss-budget locks? The hard part is knowing whether the Q4 target is a model problem, a rules problem, or a reporting problem. I attached the review sheet.",
    channel: 'email',
    touch_type: 'cold_email_first_touch',
    eventName: 'Money20/20 Europe 2026',
    personaPriorities: ['same-day fraud model drift review'],
    personaPainPoints: ['manual model-drift detection ships two weeks of chargebacks'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('clearCta');
});

test('validate-touch CLI rejects comma-spliced asset CTAs', () => {
  const payload = {
    subject: 'drift review',
    body: "{{first_name}}, model-drift reviews get painful when someone runs the query every two weeks and chargebacks have already shipped. How are you catching drift in real time at {{company}} before next year's loss-budget locks? The hard part is knowing whether the Q4 target is a model problem, a rules problem, or a reporting problem. I attached the review sheet, worth looking into?",
    channel: 'email',
    touch_type: 'cold_email_first_touch',
    eventName: 'Money20/20 Europe 2026',
    personaPriorities: ['same-day fraud model drift review'],
    personaPainPoints: ['manual model-drift detection ships two weeks of chargebacks'],
  };
  const result = spawnSync('node', ['scripts/validate-touch.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain(
    'commaSplicedCta',
  );
});

test('validate-sequence CLI rejects repeated pain angles across channels', () => {
  const payload = {
    sequencesByPersona: {
      payments_leader: {
        touches: [
          {
            touch_slot: 1,
            channel: 'email',
            body: '{{first_name}}, exception ownership at {{company}} is split across product and risk.',
            pain_angle: {
              label: 'exception ownership',
              sourcePain: 'ownership split across product and risk',
            },
          },
          {
            touch_slot: 2,
            channel: 'linkedin',
            body: '{{first_name}}, the same exception ownership question at {{company}} can stall the roadmap.',
            pain_angle: {
              label: 'exception ownership',
              sourcePain: 'ownership split across product and risk',
            },
          },
        ],
      },
    },
  };
  const result = spawnSync('node', ['scripts/validate-sequence.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(false);
  expect(parsed.errors.map((e: { rule: string }) => e.rule)).toContain('painAngleReused');
});

test('validate-sequence CLI accepts distinct pain angles across a sequence', () => {
  const payload = {
    sequencesByPersona: {
      payments_leader: {
        touches: [
          {
            touch_slot: 1,
            channel: 'email',
            body: '{{first_name}}, audit evidence at {{company}} is scattered across rail dashboards.',
            pain_angle: {
              label: 'audit evidence split',
              sourcePain: 'audit evidence scattered across rail dashboards',
            },
          },
          {
            touch_slot: 2,
            channel: 'linkedin',
            body: '{{first_name}}, roadmap freeze timing can bury the payment-auth work until Q4.',
            pain_angle: {
              label: 'roadmap freeze timing',
              sourcePain: 'payment-auth work buried until Q4',
            },
          },
        ],
      },
    },
  };
  const result = spawnSync('node', ['scripts/validate-sequence.mjs', '--stdin'], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
  });
  expect(result.status).toBe(0);
  const parsed = JSON.parse(result.stdout);
  expect(parsed.isValid).toBe(true);
  expect(parsed.checks.sequences.payments_leader.distinctPainAngleCount).toBe(2);
});
