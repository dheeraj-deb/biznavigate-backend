import { DailyScheduleParams, IntervalScheduleParams, ScheduleParams, WeeklyScheduleParams } from '../triggers/trigger-schemas';

/**
 * Translates a ScheduleParams payload into BullMQ "repeat" options. BullMQ
 * accepts either `{ pattern, tz }` (cron) or `{ every }` (interval ms).
 */
export interface RepeatPlan {
  /** Cron expression in the target timezone, or null when the schedule is one-shot/interval. */
  pattern?: string;
  /** Run every N milliseconds (BullMQ "every"). Mutually exclusive with pattern. */
  every?: number;
  /** IANA timezone used by BullMQ to interpret the cron pattern. */
  tz?: string;
  /** Wall-clock instant for one-time schedules; jobs are added with delay, no repeat. */
  runAt?: number;
  /** Friendly description for logs/UI. */
  description: string;
}

const MIN_INTERVAL_MINUTES = 5;

export function buildRepeatPlan(schedule: ScheduleParams, timezone: string): RepeatPlan {
  switch (schedule.mode) {
    case 'daily':
      return buildDaily(schedule, timezone);
    case 'weekly':
      return buildWeekly(schedule, timezone);
    case 'interval':
      return buildInterval(schedule);
    case 'one_time':
      return buildOneTime(schedule, timezone);
    default:
      throw new Error(`Unknown schedule mode: ${(schedule as any).mode}`);
  }
}

function buildDaily(s: DailyScheduleParams, tz: string): RepeatPlan {
  const [h, m] = parseHHMM(s.time);
  return {
    pattern: `${m} ${h} * * *`,
    tz,
    description: `Daily at ${s.time} (${tz})`,
  };
}

function buildWeekly(s: WeeklyScheduleParams, tz: string): RepeatPlan {
  if (!Array.isArray(s.days) || s.days.length === 0) {
    throw new Error('Weekly schedule requires at least one day');
  }
  const validDays = s.days.filter((d) => d >= 0 && d <= 6);
  if (validDays.length === 0) {
    throw new Error('Weekly schedule days must be between 0 (Sun) and 6 (Sat)');
  }
  const [h, m] = parseHHMM(s.time);
  // cron weekday is 0–6 (Sun–Sat) — same convention we use upstream.
  const dow = [...new Set(validDays)].sort((a, b) => a - b).join(',');
  return {
    pattern: `${m} ${h} * * ${dow}`,
    tz,
    description: `Weekly on ${dow} at ${s.time} (${tz})`,
  };
}

function buildInterval(s: IntervalScheduleParams): RepeatPlan {
  const minutes = Math.max(MIN_INTERVAL_MINUTES, Math.floor(Number(s.every_minutes) || 0));
  return {
    every: minutes * 60 * 1000,
    description: `Every ${minutes} minutes`,
  };
}

function buildOneTime(s: any, tz: string): RepeatPlan {
  const t = Date.parse(s.run_at);
  if (Number.isNaN(t)) throw new Error(`Invalid run_at: ${s.run_at}`);
  return {
    runAt: t,
    tz,
    description: `Once at ${new Date(t).toISOString()} (${tz})`,
  };
}

function parseHHMM(value: string): [number, number] {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
  if (!match) throw new Error(`Invalid time: ${value}`);
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) throw new Error(`Out-of-range time: ${value}`);
  return [h, m];
}
