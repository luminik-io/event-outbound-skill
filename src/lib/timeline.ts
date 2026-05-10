import type { TimelineTouchpoint } from '../types/index.js';

/**
 * Pure timing logic for an event-driven outreach sequence.
 *
 * Given a lead time (1–8 weeks) and allowed channels, return the scheduled
 * touchpoints as offsets relative to the event day (day 0). Negative offsets
 * are before the event, positive offsets after.
 *
 * Sane defaults (from manifest T10):
 *   4-week, both channels:
 *     - LI connect     -28d  (touch_slot 1)
 *     - email          -14d  (touch_slot 2)
 *     - LI nudge        -7d  (touch_slot 3)
 *     - LI day-of        0d  (touch_slot 4)
 *     - email follow-up +2d  (touch_slot 5)
 *     - LI follow-up    +7d  (touch_slot 6)
 *
 *   1-week, both channels: collapsed to 3 pre-event + day-of + follow-ups.
 *   8-week, both channels: adds an earlier LI connect at -56d and an earlier
 *     email at -28d.
 *
 *   Email-only / LinkedIn-only: LI-only or email-only touchpoints from the
 *     dual-channel plan are dropped, and touch_slots are renumbered 1..N in
 *     chronological order.
 */
export function generateTimeline(
  leadTimeWeeks: number,
  channels: ('email' | 'linkedin')[],
): TimelineTouchpoint[] {
  if (!Number.isFinite(leadTimeWeeks) || leadTimeWeeks < 1) {
    throw new Error(`leadTimeWeeks must be >= 1, got ${leadTimeWeeks}`);
  }
  if (leadTimeWeeks > 8) {
    throw new Error(`leadTimeWeeks must be <= 8, got ${leadTimeWeeks}`);
  }
  if (channels.length === 0) {
    throw new Error('channels must contain at least one of "email" or "linkedin"');
  }

  type Draft = Omit<TimelineTouchpoint, 'touch_slot'>;
  const enabled = new Set(channels);

  if (enabled.size === 1 && enabled.has('email')) {
    const weeks =
      leadTimeWeeks <= 6
        ? Array.from({ length: leadTimeWeeks }, (_, i) => leadTimeWeeks - i)
        : [
            leadTimeWeeks,
            Math.ceil(leadTimeWeeks * 0.75),
            Math.ceil(leadTimeWeeks * 0.5),
            3,
            2,
            1,
          ];
    const preEvent = Array.from(new Set(weeks))
      .sort((a, b) => b - a)
      .map((week) => ({ offset_days: -week * 7, channel: 'email' as const }));
    const plan: Draft[] = [
      ...preEvent,
      { offset_days: 0, channel: 'email' },
      { offset_days: 3, channel: 'email' },
    ];

    return plan.map((t, i) => ({
      offset_days: t.offset_days,
      channel: t.channel,
      touch_slot: i + 1,
    }));
  }

  // Canonical 4-week plan. Other lead times are derived from this.
  const base: Draft[] = [
    { offset_days: -28, channel: 'linkedin' }, // connect
    { offset_days: -14, channel: 'email' }, // cold email
    { offset_days: -7, channel: 'linkedin' }, // nudge
    { offset_days: 0, channel: 'linkedin' }, // day-of
    { offset_days: 2, channel: 'email' }, // post-event follow-up
    { offset_days: 7, channel: 'linkedin' }, // post-event nudge
  ];

  let plan: Draft[];

  if (leadTimeWeeks >= 4 && leadTimeWeeks <= 6) {
    // Scale the pre-event touches proportionally but keep the shape.
    const scale = leadTimeWeeks / 4;
    plan = base.map((t) =>
      t.offset_days < 0
        ? { ...t, offset_days: Math.round(t.offset_days * scale) }
        : t,
    );
  } else if (leadTimeWeeks >= 7) {
    // 7–8 weeks: add an earlier LI connect + email to seed familiarity.
    const earliest = -leadTimeWeeks * 7;
    const earlyEmail = Math.round(earliest / 2);
    plan = [
      { offset_days: earliest, channel: 'linkedin' },
      { offset_days: earlyEmail, channel: 'email' },
      ...base,
    ];
  } else if (leadTimeWeeks === 3) {
    // Compress slightly: -21, -10, -5, 0, +2, +7
    plan = [
      { offset_days: -21, channel: 'linkedin' },
      { offset_days: -10, channel: 'email' },
      { offset_days: -5, channel: 'linkedin' },
      { offset_days: 0, channel: 'linkedin' },
      { offset_days: 2, channel: 'email' },
      { offset_days: 7, channel: 'linkedin' },
    ];
  } else if (leadTimeWeeks === 2) {
    plan = [
      { offset_days: -14, channel: 'linkedin' },
      { offset_days: -7, channel: 'email' },
      { offset_days: -2, channel: 'linkedin' },
      { offset_days: 0, channel: 'linkedin' },
      { offset_days: 2, channel: 'email' },
      { offset_days: 7, channel: 'linkedin' },
    ];
  } else {
    // 1 week: collapsed — one LI connect, one pre-event email, day-of, follow-up.
    plan = [
      { offset_days: -5, channel: 'linkedin' },
      { offset_days: -2, channel: 'email' },
      { offset_days: 0, channel: 'linkedin' },
      { offset_days: 2, channel: 'email' },
    ];
  }

  // Filter by enabled channels.
  plan = plan.filter((t) => enabled.has(t.channel));

  // Sort chronologically and assign touch_slot 1..N.
  plan.sort((a, b) => a.offset_days - b.offset_days);

  return plan.map((t, i) => ({
    offset_days: t.offset_days,
    channel: t.channel,
    touch_slot: i + 1,
  }));
}
