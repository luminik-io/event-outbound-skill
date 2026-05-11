#!/usr/bin/env node
// Deterministic checks for checked-in Claude showcase outputs.
//
// This script does not call Claude. It verifies that the repo-visible outputs
// from real Claude runs still satisfy the hard invariants that matter for
// world-class event outbound: no invented logistics, no event-location CTAs,
// no proof/assets in strict no-invention mode, and sane cadence math.

import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const SHOWCASE = join(ROOT, 'examples', 'claude-showcase');
const DAY_MS = 86_400_000;

const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(...parts) {
  return readFileSync(join(...parts), 'utf8');
}

function readJson(...parts) {
  return JSON.parse(readText(...parts));
}

function assertIncludes(text, needles, label) {
  for (const needle of needles) {
    if (!text.toLowerCase().includes(needle.toLowerCase())) {
      fail(`${label}: missing "${needle}"`);
    }
  }
}

function assertNotIncludes(text, needles, label) {
  for (const needle of needles) {
    if (text.toLowerCase().includes(needle.toLowerCase())) {
      fail(`${label}: forbidden phrase "${needle}"`);
    }
  }
}

function daysBetween(a, b) {
  const left = Date.parse(`${a}T00:00:00Z`);
  const right = Date.parse(`${b}T00:00:00Z`);
  return Math.round((left - right) / DAY_MS);
}

function flattenTouches(output) {
  return Object.values(output.sequencesByPersona || {}).flatMap(
    (sequence) => sequence.touches || [],
  );
}

function checkPositiveCase() {
  const dir = join(SHOWCASE, 'rich-positive-availability-unknown');
  const finalSequence = readText(dir, 'final_sequence.md');
  const output = readJson(dir, 'sequencer-output.json');
  const sequenceValidation = JSON.parse(
    execFileSync('node', ['scripts/validate-sequence.mjs', '--sequence', join(dir, 'sequencer-output.json')], {
      cwd: ROOT,
      encoding: 'utf8',
    }),
  );
  const touches = flattenTouches(output);

  if (output.strictTruth !== true) fail('positive: strictTruth must be true');
  if (output.summary?.validatorStatus !== 'all_passing') {
    fail('positive: summary.validatorStatus must be all_passing');
  }
  if (sequenceValidation.isValid !== true) {
    fail(
      `positive: sequence-level angle validation failed: ${sequenceValidation.errors
        .map((error) => error.rule)
        .join(', ')}`,
    );
  }
  if (touches.length !== 4) fail(`positive: expected 4 touches, got ${touches.length}`);

  assertIncludes(finalSequence, ['Sender logistics', 'unknown', 'No meetup CTAs'], 'positive');
  assertNotIncludes(
    `${finalSequence}\n${JSON.stringify(output)}`,
    [
      'before Amsterdam',
      'Amsterdam prep',
      'pressure-testing before',
      'Open to a look',
      'hope the week in',
      'hope the event went well',
      'hope the event was productive',
      'side of the agenda',
    ],
    'positive',
  );

  const minGapDays = output.summary?.minGapDays ?? 4;
  let previousSendDate;
  for (const touch of touches) {
    const label = `positive touch ${touch.touch_slot ?? '?'}`;
    if (!touch.send_date) fail(`${label}: missing send_date`);
    if (!Number.isFinite(touch.offset_days)) fail(`${label}: missing offset_days`);
    if ((touch.validation_errors || []).length > 0) {
      fail(`${label}: validation_errors must be empty`);
    }
    if (!touch.pain_angle?.label) fail(`${label}: missing pain_angle.label`);
    const checks = touch.checks || {};
    assertNotIncludes(touch.body || '', ['I am around', "I'm around", 'side of the agenda'], label);
    for (const key of [
      'bannedWordsFound',
      'permissionToSendHits',
      'forcedEventPhrasingHits',
      'missingMergeFields',
      'assetPromiseHits',
      'proofClaimHits',
      'previewSellerHits',
      'previewEventHits',
    ]) {
      if ((checks[key] || []).length > 0) fail(`${label}: ${key} must be empty`);
    }
    if (checks.hasEmDash) fail(`${label}: hasEmDash must be false`);
    if (checks.hasExclamation) fail(`${label}: hasExclamation must be false`);
    if (output.event?.startDate && touch.send_date && Number.isFinite(touch.offset_days)) {
      const computedOffset = daysBetween(touch.send_date, output.event.startDate);
      if (computedOffset !== touch.offset_days) {
        fail(`${label}: send_date ${touch.send_date} does not match offset ${touch.offset_days}`);
      }
    }
    if (previousSendDate) {
      const gap = daysBetween(touch.send_date, previousSendDate);
      if (gap < minGapDays) fail(`${label}: gap ${gap} is below minGapDays ${minGapDays}`);
    }
    previousSendDate = touch.send_date;
  }
}

function checkGuardCase(caseName, required, forbidden = []) {
  const dir = join(SHOWCASE, caseName);
  const output = readText(dir, 'claude-output.txt');
  assertIncludes(output, required, caseName);
  assertNotIncludes(output, ['skill is not loaded', "skill isn't loaded", 'Unknown skill'], caseName);
  assertNotIncludes(output, forbidden, caseName);
  if (existsSync(join(dir, 'final_sequence.md'))) {
    fail(`${caseName}: guardrail case should not include final_sequence.md`);
  }
  if (existsSync(join(dir, 'sequencer-output.json'))) {
    fail(`${caseName}: guardrail case should not include sequencer-output.json`);
  }
}

checkPositiveCase();
checkGuardCase('thin-input-probe', [
  'cannot proceed',
  'thin inputs',
  'sender company',
  'Proof posture',
  'Assets',
  'Persona/event fit',
]);
checkGuardCase('impossible-cadence', [
  'mathematically impossible',
  '20 days',
  '7 days',
  'Keep the 4-day gap',
  'Mix pre + post',
]);
checkGuardCase('wrong-persona-guard', [
  'persona-angle mismatch',
  'Head of Payments',
  'field marketing / demand gen',
  'switch the persona',
  'switch the angle',
]);

if (failures.length > 0) {
  process.stderr.write(`Claude showcase checks failed:\n${failures.map((f) => `- ${f}`).join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('Claude showcase checks passed\n');
