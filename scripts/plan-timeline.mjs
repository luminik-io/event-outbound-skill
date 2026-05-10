#!/usr/bin/env node
// Deterministic cadence planner for the event-outbound skill.
//
// Reads a JSON request from stdin and writes timeline offsets to stdout.
// This is intentionally dependency-free so Claude can call it inside an
// installed plugin before drafting copy.

const DAY_MS = 86_400_000;

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
};

const withSlots = (plan) =>
  plan.map((touch, index) => ({
    ...touch,
    touch_slot: index + 1,
  }));

const parseDateOnly = (value, label) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    throw new Error(`${label} must be YYYY-MM-DD`);
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is invalid`);
  return date;
};

const resolveLeadWindowDays = (leadTimeWeeks, options) => {
  const requestedLeadDays = leadTimeWeeks * 7;
  if (!options.eventStartDate || !options.today) return requestedLeadDays;
  const eventStart = parseDateOnly(options.eventStartDate, 'eventStartDate');
  const today = parseDateOnly(options.today, 'today');
  const daysUntilEvent = Math.floor((eventStart.getTime() - today.getTime()) / DAY_MS);
  if (daysUntilEvent < 0) {
    throw new Error(`today (${options.today}) is after eventStartDate (${options.eventStartDate})`);
  }
  return Math.min(requestedLeadDays, daysUntilEvent);
};

const normalizeMinGap = (offsets, minGapDays) => {
  const normalized = [...offsets].sort((a, b) => a - b);
  for (let i = 1; i < normalized.length; i += 1) {
    if (normalized[i] - normalized[i - 1] < minGapDays) {
      normalized[i] = normalized[i - 1] + minGapDays;
    }
  }
  return normalized;
};

const spreadPreEventOffsets = (leadTimeWeeks, leadWindowDays, count, minGapDays) => {
  if (count <= 0) return [];
  const earliest = -leadWindowDays;
  const latest = -minGapDays;
  if (earliest > latest) {
    throw new Error(`Not enough lead time to schedule a pre-event touch with minGapDays ${minGapDays}`);
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
  const offsets = Array.from({ length: count }, (_, i) => Math.round(earliest + step * i));
  offsets[0] = earliest;
  offsets[offsets.length - 1] = latest;
  return normalizeMinGap(offsets, minGapDays);
};

const enforceMinGap = (plan, minGapDays) => {
  const out = [];
  for (const touch of plan) {
    const last = out.at(-1);
    if (!last || touch.offset_days - last.offset_days >= minGapDays) out.push(touch);
  }
  return out;
};

const selectEvenly = (items, count) => {
  if (count >= items.length) return items;
  if (count === 1) return [items[0]];
  const step = (items.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => items[Math.round(i * step)]);
};

const buildEmailOnlyTimeline = (leadTimeWeeks, leadWindowDays, minGapDays, options) => {
  const includeDayOf = options.preEventOnly ? false : options.includeDayOf !== false;
  const includePostEvent = options.preEventOnly ? false : options.includePostEvent !== false;
  const reserved = Number(includeDayOf) + Number(includePostEvent);
  const defaultTouchCount = Math.min(8, Math.max(3, Math.min(leadTimeWeeks, 6) + reserved));
  const touchCount = options.touchCount ?? defaultTouchCount;
  if (!Number.isInteger(touchCount) || touchCount < 1) {
    throw new Error(`touchCount must be a positive integer, got ${touchCount}`);
  }
  if (touchCount <= reserved) {
    throw new Error(`touchCount ${touchCount} leaves no room for pre-event email touches`);
  }

  const preEvent = spreadPreEventOffsets(
    leadTimeWeeks,
    leadWindowDays,
    touchCount - reserved,
    minGapDays,
  ).map((offset_days) => ({ offset_days, channel: 'email' }));
  const plan = [...preEvent];
  if (includeDayOf) plan.push({ offset_days: 0, channel: 'email' });
  if (includePostEvent) plan.push({ offset_days: minGapDays, channel: 'email' });
  return plan;
};

const generateTimeline = (leadTimeWeeks, channels, options = {}) => {
  if (!Number.isFinite(leadTimeWeeks) || leadTimeWeeks < 1 || leadTimeWeeks > 8) {
    throw new Error(`leadTimeWeeks must be 1-8, got ${leadTimeWeeks}`);
  }
  if (!Array.isArray(channels) || channels.length === 0) {
    throw new Error('channels must contain at least one of "email" or "linkedin"');
  }
  const minGapDays = options.minGapDays ?? 4;
  if (!Number.isFinite(minGapDays) || minGapDays < 1) {
    throw new Error(`minGapDays must be >= 1, got ${minGapDays}`);
  }
  const enabled = new Set(channels);
  const leadWindowDays = resolveLeadWindowDays(leadTimeWeeks, options);

  if (enabled.size === 1 && enabled.has('email')) {
    return withSlots(buildEmailOnlyTimeline(leadTimeWeeks, leadWindowDays, minGapDays, options));
  }

  let plan;
  const base = [
    { offset_days: -28, channel: 'linkedin' },
    { offset_days: -14, channel: 'email' },
    { offset_days: -7, channel: 'linkedin' },
    { offset_days: 0, channel: 'linkedin' },
    { offset_days: minGapDays, channel: 'email' },
    { offset_days: minGapDays * 2, channel: 'linkedin' },
  ];
  if (leadTimeWeeks >= 4 && leadTimeWeeks <= 6) {
    const scale = leadTimeWeeks / 4;
    plan = base.map((t) =>
      t.offset_days < 0 ? { ...t, offset_days: Math.round(t.offset_days * scale) } : t,
    );
  } else if (leadTimeWeeks >= 7) {
    const earliest = -leadTimeWeeks * 7;
    plan = [
      { offset_days: earliest, channel: 'linkedin' },
      { offset_days: Math.round(earliest / 2), channel: 'email' },
      ...base,
    ];
  } else if (leadTimeWeeks === 3) {
    plan = [
      { offset_days: -21, channel: 'linkedin' },
      { offset_days: -10, channel: 'email' },
      { offset_days: -5, channel: 'linkedin' },
      { offset_days: 0, channel: 'linkedin' },
      { offset_days: minGapDays, channel: 'email' },
      { offset_days: minGapDays * 2, channel: 'linkedin' },
    ];
  } else if (leadTimeWeeks === 2) {
    plan = [
      { offset_days: -14, channel: 'linkedin' },
      { offset_days: -7, channel: 'email' },
      { offset_days: -2, channel: 'linkedin' },
      { offset_days: 0, channel: 'linkedin' },
      { offset_days: minGapDays, channel: 'email' },
      { offset_days: minGapDays * 2, channel: 'linkedin' },
    ];
  } else {
    plan = [
      { offset_days: -5, channel: 'linkedin' },
      { offset_days: -2, channel: 'email' },
      { offset_days: 0, channel: 'linkedin' },
      { offset_days: minGapDays, channel: 'email' },
    ];
  }

  plan = plan
    .filter((t) => enabled.has(t.channel))
    .filter((t) => t.offset_days >= 0 || t.offset_days >= -leadWindowDays)
    .sort((a, b) => a.offset_days - b.offset_days);
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
};

try {
  const input = JSON.parse(await readStdin());
  const timeline = generateTimeline(input.leadTimeWeeks ?? 4, input.channels ?? ['email'], input);
  process.stdout.write(JSON.stringify({ isValid: true, timeline }, null, 2));
} catch (error) {
  process.stdout.write(
    JSON.stringify(
      {
        isValid: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
}
