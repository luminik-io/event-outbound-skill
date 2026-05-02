import { describe, it, expect } from 'vitest';
import { generateTimeline } from '../src/lib/timeline.js';

describe('generateTimeline', () => {
  it('4-week default with both channels produces the canonical 6-touch plan', () => {
    const plan = generateTimeline(4, ['email', 'linkedin']);
    expect(plan).toEqual([
      { offset_days: -28, channel: 'linkedin', touch_slot: 1 },
      { offset_days: -14, channel: 'email', touch_slot: 2 },
      { offset_days: -7, channel: 'linkedin', touch_slot: 3 },
      { offset_days: 0, channel: 'linkedin', touch_slot: 4 },
      { offset_days: 2, channel: 'email', touch_slot: 5 },
      { offset_days: 7, channel: 'linkedin', touch_slot: 6 },
    ]);
  });

  it('1-week lead is collapsed to 4 touches', () => {
    const plan = generateTimeline(1, ['email', 'linkedin']);
    expect(plan.length).toBe(4);
    expect(plan[0].offset_days).toBeGreaterThanOrEqual(-7);
    expect(plan[0].offset_days).toBeLessThan(0);
    // day-of present
    expect(plan.some((t) => t.offset_days === 0)).toBe(true);
    // chronological
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].offset_days).toBeGreaterThanOrEqual(plan[i - 1].offset_days);
    }
    // touch_slots start at 1 and increment
    expect(plan.map((t) => t.touch_slot)).toEqual([1, 2, 3, 4]);
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

  it('email-only variant drops all LinkedIn touches', () => {
    const plan = generateTimeline(4, ['email']);
    expect(plan.every((t) => t.channel === 'email')).toBe(true);
    expect(plan.length).toBeGreaterThan(0);
    // slots renumbered 1..N
    expect(plan.map((t) => t.touch_slot)).toEqual(
      plan.map((_, i) => i + 1),
    );
  });

  it('linkedin-only variant drops all email touches', () => {
    const plan = generateTimeline(4, ['linkedin']);
    expect(plan.every((t) => t.channel === 'linkedin')).toBe(true);
    expect(plan.length).toBeGreaterThan(0);
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
});
