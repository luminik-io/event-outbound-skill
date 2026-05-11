import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { generateTimeline } from '../src/lib/timeline.js';

describe('generateTimeline', () => {
  it('4-week default with both channels produces the canonical 6-touch plan', () => {
    const plan = generateTimeline(4, ['email', 'linkedin']);
    expect(plan).toEqual([
      { offset_days: -28, channel: 'linkedin', touch_slot: 1 },
      { offset_days: -14, channel: 'email', touch_slot: 2 },
      { offset_days: -7, channel: 'linkedin', touch_slot: 3 },
      { offset_days: 0, channel: 'linkedin', touch_slot: 4 },
      { offset_days: 4, channel: 'email', touch_slot: 5 },
      { offset_days: 8, channel: 'linkedin', touch_slot: 6 },
    ]);
  });

  it('1-week lead is collapsed while preserving 4-day gaps', () => {
    const plan = generateTimeline(1, ['email', 'linkedin']);
    expect(plan.length).toBe(3);
    expect(plan[0].offset_days).toBeGreaterThanOrEqual(-7);
    expect(plan[0].offset_days).toBeLessThan(0);
    // day-of present
    expect(plan.some((t) => t.offset_days === 0)).toBe(true);
    // chronological
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].offset_days).toBeGreaterThanOrEqual(plan[i - 1].offset_days);
    }
    // touch_slots start at 1 and increment
    expect(plan.map((t) => t.touch_slot)).toEqual([1, 2, 3]);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].offset_days - plan[i - 1].offset_days).toBeGreaterThanOrEqual(4);
    }
  });

  it('8-week lead adds earlier seeding touches', () => {
    const plan = generateTimeline(8, ['email', 'linkedin']);
    // Earliest touch is at or before -56 (8 weeks before).
    expect(plan[0].offset_days).toBeLessThanOrEqual(-56);
    // More touches than the 4-week baseline.
    expect(plan.length).toBeGreaterThan(6);
    // Chronological, touch_slots contiguous from 1.
    expect(plan.map((t) => t.touch_slot)).toEqual(
      plan.map((_, i) => i + 1),
    );
  });

  it('4-week email-only variant expands into a full 6-touch cadence', () => {
    const plan = generateTimeline(4, ['email']);
    expect(plan).toEqual([
      { offset_days: -28, channel: 'email', touch_slot: 1 },
      { offset_days: -21, channel: 'email', touch_slot: 2 },
      { offset_days: -14, channel: 'email', touch_slot: 3 },
      { offset_days: -7, channel: 'email', touch_slot: 4 },
      { offset_days: 0, channel: 'email', touch_slot: 5 },
      { offset_days: 4, channel: 'email', touch_slot: 6 },
    ]);
  });

  it('linkedin-only variant drops all email touches', () => {
    const plan = generateTimeline(4, ['linkedin']);
    expect(plan.every((t) => t.channel === 'linkedin')).toBe(true);
    expect(plan.length).toBeGreaterThan(0);
  });

  it('8-week email-only variant stays within the 8-touch ceiling', () => {
    const plan = generateTimeline(8, ['email']);
    expect(plan.every((t) => t.channel === 'email')).toBe(true);
    expect(plan.length).toBe(8);
    expect(plan[0].offset_days).toBe(-56);
    expect(plan.at(-1)?.offset_days).toBe(4);
  });

  it('supports user-configured touch count', () => {
    const plan = generateTimeline(4, ['email'], { touchCount: 4 });
    expect(plan.length).toBe(4);
    expect(plan.map((t) => t.touch_slot)).toEqual([1, 2, 3, 4]);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].offset_days - plan[i - 1].offset_days).toBeGreaterThanOrEqual(4);
    }
  });

  it('uses today and eventStartDate to avoid scheduling in the past', () => {
    const plan = generateTimeline(4, ['email'], {
      today: '2026-05-10',
      eventStartDate: '2026-06-02',
      touchCount: 6,
      minGapDays: 4,
    });
    expect(plan[0].offset_days).toBe(-23);
    expect(plan.every((t) => t.offset_days >= -23)).toBe(true);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].offset_days - plan[i - 1].offset_days).toBeGreaterThanOrEqual(4);
    }
  });

  it('can infer eventStartDate from a human event date string', () => {
    const plan = generateTimeline(4, ['email'], {
      today: '2026-05-11',
      eventDates: 'June 2-4, 2026',
      touchCount: 6,
      minGapDays: 4,
    });
    expect(plan.map((touch) => touch.offset_days)).toEqual([-22, -16, -10, -4, 0, 4]);
  });

  it('rejects impossible touch counts for the available lead window', () => {
    expect(() =>
      generateTimeline(1, ['email'], {
        touchCount: 6,
        minGapDays: 4,
      }),
    ).toThrow(/pre-event touches/);
  });

  it('exposes the same planning contract through the installed-skill CLI', () => {
    const output = execFileSync('node', ['scripts/plan-timeline.mjs'], {
      input: JSON.stringify({
        leadTimeWeeks: 4,
        channels: ['email'],
        touchCount: 6,
        minGapDays: 4,
        today: '2026-05-10',
        eventStartDate: '2026-06-02',
      }),
      encoding: 'utf8',
    });
    const parsed = JSON.parse(output);
    expect(parsed.isValid).toBe(true);
    expect(parsed.timeline[0].offset_days).toBe(-23);
    expect(parsed.timeline[0].send_date).toBe('2026-05-10');
    expect(parsed.timeline).toHaveLength(6);
  });

  it('installed-skill CLI infers eventStartDate from eventDates', () => {
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
    expect(parsed.timeline.map((touch: { send_date: string }) => touch.send_date)).toEqual([
      '2026-05-11',
      '2026-05-17',
      '2026-05-23',
      '2026-05-29',
      '2026-06-02',
      '2026-06-06',
    ]);
  });

  it('rejects out-of-range lead times', () => {
    expect(() => generateTimeline(0, ['email'])).toThrow();
    expect(() => generateTimeline(9, ['email'])).toThrow();
  });

  it('rejects empty channels list', () => {
    expect(() => generateTimeline(4, [] as ('email' | 'linkedin')[])).toThrow();
  });

  it('produces valid plans for every supported lead time 1..8', () => {
    for (let w = 1; w <= 8; w++) {
      const plan = generateTimeline(w, ['email', 'linkedin']);
      expect(plan.length).toBeGreaterThan(0);
      // Always have at least one day-of or post-event touch.
      expect(plan.some((t) => t.offset_days >= 0)).toBe(true);
      // Always have at least one pre-event touch.
      expect(plan.some((t) => t.offset_days < 0)).toBe(true);
    }
  });

  it('keeps spacing valid across many user-configured email-only cadences', () => {
    for (const touchCount of [3, 4, 5, 6, 7, 8]) {
      for (const minGapDays of [4, 5, 6]) {
        const plan = generateTimeline(8, ['email'], {
          today: '2026-05-01',
          eventStartDate: '2026-06-30',
          touchCount,
          minGapDays,
        });
        expect(plan).toHaveLength(touchCount);
        expect(plan.map((touch) => touch.touch_slot)).toEqual(
          plan.map((_, index) => index + 1),
        );
        for (let i = 1; i < plan.length; i++) {
          expect(plan[i].offset_days - plan[i - 1].offset_days).toBeGreaterThanOrEqual(
            minGapDays,
          );
        }
      }
    }
  });
});
