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
