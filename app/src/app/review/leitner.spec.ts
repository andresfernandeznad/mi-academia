import { CardState, addDays, dueCards, localDate, review } from './leitner';

describe('localDate', () => {
  it('uses the local calendar day, not the UTC one', () => {
    // 00:30 local time: toISOString() would give the previous day in zones east of UTC.
    expect(localDate(new Date(2026, 9, 31, 0, 30))).toBe('2026-10-31');
  });
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-10-30', 2)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('is not affected by daylight saving changes', () => {
    // Europe moves clocks back on 2026-10-25.
    expect(addDays('2026-10-24', 1)).toBe('2026-10-25');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
  });
});

describe('review', () => {
  const today = '2026-10-30';

  it('starts a new card in box 2 when it is easy, due in 2 days', () => {
    expect(review(undefined, 'easy', 'q1', today)).toEqual({ questionId: 'q1', box: 2, due: '2026-11-01' });
  });

  it('starts a new card in box 1 when it is unsure or failed, due tomorrow', () => {
    expect(review(undefined, 'unsure', 'q1', today)).toEqual({ questionId: 'q1', box: 1, due: '2026-10-31' });
    expect(review(undefined, 'failed', 'q1', today)).toEqual({ questionId: 'q1', box: 1, due: '2026-10-31' });
  });

  it('promotes an easy card one box and doubles the interval', () => {
    const card: CardState = { questionId: 'q1', box: 3, due: today };

    expect(review(card, 'easy', 'q1', today)).toEqual({ questionId: 'q1', box: 4, due: '2026-11-07' });
  });

  it('keeps an unsure card in its box', () => {
    const card: CardState = { questionId: 'q1', box: 3, due: today };

    expect(review(card, 'unsure', 'q1', today)).toEqual({ questionId: 'q1', box: 3, due: '2026-11-03' });
  });

  it('sends a failed card back to box 1', () => {
    const card: CardState = { questionId: 'q1', box: 4, due: today };

    expect(review(card, 'failed', 'q1', today)).toEqual({ questionId: 'q1', box: 1, due: '2026-10-31' });
  });

  it('never goes beyond box 5 (every 16 days)', () => {
    const card: CardState = { questionId: 'q1', box: 5, due: today };

    expect(review(card, 'easy', 'q1', today)).toEqual({ questionId: 'q1', box: 5, due: '2026-11-15' });
  });
});

describe('dueCards', () => {
  it('returns overdue and today cards, weakest box first, then oldest due', () => {
    const cards: CardState[] = [
      { questionId: 'future', box: 1, due: '2026-10-31' },
      { questionId: 'box3', box: 3, due: '2026-10-30' },
      { questionId: 'box1-old', box: 1, due: '2026-10-28' },
      { questionId: 'box1-today', box: 1, due: '2026-10-30' },
    ];

    expect(dueCards(cards, '2026-10-30').map((c) => c.questionId)).toEqual(['box1-old', 'box1-today', 'box3']);
  });
});
