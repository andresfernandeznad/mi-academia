import { describe, expect, it } from 'vitest';
import { currentStreak, daysFromCards, mergeDays, weekDays } from './study-days';

describe('currentStreak', () => {
  it('is 0 when there is no study day', () => {
    expect(currentStreak(new Set(), '2026-11-04')).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    expect(currentStreak(new Set(['2026-11-02', '2026-11-03', '2026-11-04']), '2026-11-04')).toBe(3);
  });

  it('stays alive until today ends if yesterday was studied', () => {
    expect(currentStreak(new Set(['2026-11-02', '2026-11-03']), '2026-11-04')).toBe(2);
  });

  it('is broken by a missed day', () => {
    expect(currentStreak(new Set(['2026-11-01', '2026-11-02']), '2026-11-04')).toBe(0);
    expect(currentStreak(new Set(['2026-11-01', '2026-11-03', '2026-11-04']), '2026-11-04')).toBe(2);
  });

  it('crosses month boundaries', () => {
    expect(currentStreak(new Set(['2026-10-31', '2026-11-01']), '2026-11-01')).toBe(2);
  });
});

describe('weekDays', () => {
  it('returns Monday to Sunday of the week that contains the day', () => {
    // 2026-11-04 is a Wednesday.
    expect(weekDays('2026-11-04')).toEqual([
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
      '2026-11-07',
      '2026-11-08',
    ]);
  });

  it('treats Sunday as the last day of its week, not the first', () => {
    expect(weekDays('2026-11-08')[0]).toBe('2026-11-02');
  });
});

describe('mergeDays', () => {
  it('uploads what only this device has and stores what only the server has', () => {
    expect(mergeDays(new Set(['2026-11-02', '2026-11-03']), ['2026-11-03', '2026-11-04'])).toEqual({
      toUpload: ['2026-11-02'],
      toStore: ['2026-11-04'],
    });
  });
});

describe('daysFromCards', () => {
  it('recovers the local day of each card change, without duplicates or undated cards', () => {
    // Built from local times, so the expectation holds in any time zone.
    const at = (y: number, m: number, d: number, h: number) => new Date(y, m - 1, d, h).toISOString();
    const cards = [
      { questionId: 'a', box: 1, due: '2026-11-01', updatedAt: at(2026, 10, 30, 9) },
      { questionId: 'b', box: 1, due: '2026-11-01', updatedAt: at(2026, 10, 30, 22) },
      { questionId: 'c', box: 1, due: '2026-11-01', updatedAt: at(2026, 10, 31, 8) },
      { questionId: 'd', box: 1, due: '2026-11-01' },
    ];

    expect(daysFromCards(cards).sort()).toEqual(['2026-10-30', '2026-10-31']);
  });
});
