/**
 * Leitner system: each question lives in a box; box N is reviewed every INTERVALS[N - 1] days.
 * Easy moves a card up one box, unsure keeps it, failed sends it back to box 1.
 *
 * Dates are calendar days ("YYYY-MM-DD") in the learner's local time zone. A review is due on a day,
 * not at an instant, so using Date objects here would only invite time zone and DST bugs.
 */
export type Rating = 'easy' | 'unsure' | 'failed';

export interface CardState {
  questionId: string;
  box: number;
  /** Local calendar day ("YYYY-MM-DD") on which the card is due. */
  due: string;
}

const INTERVALS = [1, 2, 4, 8, 16];
const MAX_BOX = INTERVALS.length;

const pad = (n: number) => String(n).padStart(2, '0');

export function localDate(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Calendar arithmetic in UTC, where no day is ever 23 or 25 hours long. */
export function addDays(day: string, days: number): string {
  const [year, month, date] = day.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, date + days));
  return `${result.getUTCFullYear()}-${pad(result.getUTCMonth() + 1)}-${pad(result.getUTCDate())}`;
}

/** A question seen for the first time counts as a box 1 card. */
export function review(card: CardState | undefined, rating: Rating, questionId: string, today: string): CardState {
  const box = card?.box ?? 1;
  const next = rating === 'easy' ? Math.min(box + 1, MAX_BOX) : rating === 'unsure' ? box : 1;
  return { questionId, box: next, due: addDays(today, INTERVALS[next - 1]) };
}

export function dueCards(cards: readonly CardState[], today: string): CardState[] {
  // "YYYY-MM-DD" strings sort chronologically, so plain string comparison is enough.
  return cards
    .filter((card) => card.due <= today)
    .sort((a, b) => a.box - b.box || a.due.localeCompare(b.due));
}
