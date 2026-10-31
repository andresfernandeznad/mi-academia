import { CardState, addDays, localDate } from '../review/leitner';

/**
 * Study days are local calendar days ("YYYY-MM-DD") on which the learner answered something.
 * The set only grows, so merging two devices is a plain union: no clocks, no conflicts.
 */

/** Consecutive study days up to today; studying yesterday keeps the streak alive until today ends. */
export function currentStreak(days: ReadonlySet<string>, today: string): number {
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

/** Monday to Sunday of the week that contains `day`. */
export function weekDays(day: string): string[] {
  const [year, month, date] = day.split('-').map(Number);
  // getUTCDay() is 0 on Sunday; shift it so Monday is 0 and Sunday is 6.
  const sinceMonday = (new Date(Date.UTC(year, month - 1, date)).getUTCDay() + 6) % 7;
  const monday = addDays(day, -sinceMonday);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function mergeDays(local: ReadonlySet<string>, remote: readonly string[]): { toUpload: string[]; toStore: string[] } {
  const remoteSet = new Set(remote);
  return {
    toUpload: [...local].filter((day) => !remoteSet.has(day)),
    toStore: [...remoteSet].filter((day) => !local.has(day)),
  };
}

/** Days recoverable from the review cards: only the last change of each card survives, so it is partial. */
export function daysFromCards(cards: readonly CardState[]): string[] {
  const days = cards.flatMap((card) => (card.updatedAt ? [localDate(new Date(card.updatedAt))] : []));
  return [...new Set(days)];
}
