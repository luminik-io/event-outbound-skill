import type { TimelineTouchpoint } from '../types/index.js';

export type TimelineOptions = {
  touchCount?: number;
  minGapDays?: number;
  eventStartDate?: string;
  today?: string;
  includeDayOf?: boolean;
  includePostEvent?: boolean;
  preEventOnly?: boolean;
};

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
  options: TimelineOptions = {},
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
  const minGapDays = options.minGapDays ?? 4;
  if (!Number.isFinite(minGapDays) || minGapDays < 1) {
    throw new Error(`minGapDays must be >= 1, got ${minGapDays}`);
  }
  const leadWindowDays = resolveLeadWindowDays(leadTimeWeeks, options);

  if (enabled.size === 1 && enabled.has('email')) {
    return withSlots(
      buildEmailOnlyTimeline(leadTimeWeeks, leadWindowDays, minGapDays, options),
    );
  }

  // Canonical 4-week plan. Other lead times are derived from this.
  const base: Draft[] = [
    { offset_days: -28, channel: 'linkedin' }, // connect
    { offset_days: -14, channel: 'email' }, // cold email
    { offset_days: -7, channel: 'linkedin' }, // nudge
    { offset_days: 0, channel: 'linkedin' }, // day-of
    { offset_days: minGapDays, channel: 'email' }, // post-event follow-up
    { offset_days: minGapDays * 2, channel: 'linkedin' }, // post-event nudge
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
      { offset_days: minGapDays, channel: 'email' },
    ];
  }

  // Filter by enabled channels.
  plan = plan.filter((t) => enabled.has(t.channel));
  plan = plan.filter((t) => t.offset_days >= 0 || t.offset_days >= -leadWindowDays);

  // Sort chronologically and assign touch_slot 1..N.
  plan.sort((a, b) => a.offset_days - b.offset_days);
  plan = enforceMinGap(plan, minGapDays);

  if (options.touchCount !== undefined) {
    if (!Number.isInteger(options.touchCount) || options.touchCount < 1) {
      throw new Error(`touchCount must be a positive integer, got ${options.touchCount}`);
    }
    if (options.touchCount > plan.length) {
      throw new Error(
        `touchCount ${options.touchCount} cannot fit the ${leadTimeWeeks}-week ${channels.join(
          '+',
        )} cadence with minGapDays ${minGapDays}`,
      );
    }
    plan = selectEvenly(plan, options.touchCount);
  }

  return withSlots(plan);
}

function resolveLeadWindowDays(
  leadTimeWeeks: number,
  options: TimelineOptions,
): number {
  const requestedLeadDays = leadTimeWeeks * 7;
  if (!options.eventStartDate || !options.today) return requestedLeadDays;

  const eventStart = parseDateOnly(options.eventStartDate, 'eventStartDate');
  const today = parseDateOnly(options.today, 'today');
  const daysUntilEvent = Math.floor(
    (eventStart.getTime() - today.getTime()) / 86_400_000,
  );
  if (daysUntilEvent < 0) {
    throw new Error(
      `today (${options.today}) is after eventStartDate (${options.eventStartDate})`,
    );
  }
  return Math.min(requestedLeadDays, daysUntilEvent);
}

function parseDateOnly(value: string, label: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`${label} must be YYYY-MM-DD, got ${value}`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid date, got ${value}`);
  }
  return date;
}

function buildEmailOnlyTimeline(
  leadTimeWeeks: number,
  leadWindowDays: number,
  minGapDays: number,
  options: TimelineOptions,
): Omit<TimelineTouchpoint, 'touch_slot'>[] {
  const includeDayOf = options.preEventOnly ? false : options.includeDayOf !== false;
  const includePostEvent = options.preEventOnly ? false : options.includePostEvent !== false;
  const reserved = Number(includeDayOf) + Number(includePostEvent);
  const defaultTouchCount = Math.min(
    8,
    Math.max(3, Math.min(leadTimeWeeks, 6) + reserved),
  );
  const touchCount = options.touchCount ?? defaultTouchCount;
  if (!Number.isInteger(touchCount) || touchCount < 1) {
    throw new Error(`touchCount must be a positive integer, got ${touchCount}`);
  }
  if (touchCount <= reserved) {
    throw new Error(
      `touchCount ${touchCount} leaves no room for pre-event email touches`,
    );
  }

  const preEventCount = touchCount - reserved;
  const preEvent = spreadPreEventOffsets(
    leadTimeWeeks,
    leadWindowDays,
    preEventCount,
    minGapDays,
  ).map((offset_days) => ({ offset_days, channel: 'email' as const }));
  const plan: Omit<TimelineTouchpoint, 'touch_slot'>[] = [...preEvent];
  if (includeDayOf) plan.push({ offset_days: 0, channel: 'email' });
  if (includePostEvent) plan.push({ offset_days: minGapDays, channel: 'email' });
  return plan;
}

function spreadPreEventOffsets(
  leadTimeWeeks: number,
  leadWindowDays: number,
  count: number,
  minGapDays: number,
): number[] {
  if (count <= 0) return [];
  const earliest = -leadWindowDays;
  const latest = -minGapDays;
  if (earliest > latest) {
    throw new Error(
      `Not enough lead time to schedule a pre-event touch with minGapDays ${minGapDays}`,
    );
  }
  const capacity = Math.floor((latest - earliest) / minGapDays) + 1;
  if (count > capacity) {
    throw new Error(
      `touchCount requires ${count} pre-event touches, but only ${capacity} fit before the event with minGapDays ${minGapDays}`,
    );
  }

  if (leadWindowDays === leadTimeWeeks * 7 && count === leadTimeWeeks) {
    return Array.from({ length: count }, (_, i) => -(leadTimeWeeks - i) * 7);
  }
  if (count === 1) return [earliest];

  const step = (latest - earliest) / (count - 1);
  const offsets = Array.from({ length: count }, (_, i) =>
    Math.round(earliest + step * i),
  );
  offsets[0] = earliest;
  offsets[offsets.length - 1] = latest;
  return normalizeMinGap(offsets, minGapDays);
}

function normalizeMinGap(offsets: number[], minGapDays: number): number[] {
  const normalized = [...offsets].sort((a, b) => a - b);
  for (let i = 1; i < normalized.length; i++) {
    if (normalized[i] - normalized[i - 1] < minGapDays) {
      normalized[i] = normalized[i - 1] + minGapDays;
    }
  }
  return normalized;
}

function enforceMinGap<T extends { offset_days: number }>(
  plan: T[],
  minGapDays: number,
): T[] {
  const out: T[] = [];
  for (const touch of plan) {
    const last = out.at(-1);
    if (!last || touch.offset_days - last.offset_days >= minGapDays) {
      out.push(touch);
    }
  }
  return out;
}

function selectEvenly<T>(items: T[], count: number): T[] {
  if (count >= items.length) return items;
  if (count === 1) return [items[0]];
  const selected: T[] = [];
  const step = (items.length - 1) / (count - 1);
  for (let i = 0; i < count; i++) {
    selected.push(items[Math.round(i * step)]);
  }
  return selected;
}

function withSlots(
  plan: Omit<TimelineTouchpoint, 'touch_slot'>[],
): TimelineTouchpoint[] {
  return plan.map((t, i) => ({
    offset_days: t.offset_days,
    channel: t.channel,
    touch_slot: i + 1,
  }));
}
