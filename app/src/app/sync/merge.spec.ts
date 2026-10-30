import { CardState } from '../review/leitner';
import { mergeCards } from './merge';

const card = (questionId: string, box: number, updatedAt?: string): CardState => ({
  questionId,
  box,
  due: '2026-11-01',
  ...(updatedAt ? { updatedAt } : {}),
});

describe('mergeCards', () => {
  it('uploads cards that only exist on this device and stores the ones that only exist remotely', () => {
    const local = [card('local-only', 2, '2026-10-30T10:00:00Z')];
    const remote = [card('remote-only', 3, '2026-10-29T10:00:00Z')];

    const { toUpload, toStore } = mergeCards(local, remote);

    expect(toUpload).toEqual(local);
    expect(toStore).toEqual(remote);
  });

  it('keeps the most recently updated version of a card on both sides', () => {
    const local = [card('newer-here', 4, '2026-10-30T12:00:00Z'), card('newer-there', 1, '2026-10-30T08:00:00Z')];
    const remote = [card('newer-here', 2, '2026-10-30T09:00:00Z'), card('newer-there', 3, '2026-10-30T11:00:00Z')];

    const { toUpload, toStore } = mergeCards(local, remote);

    expect(toUpload).toEqual([local[0]]);
    expect(toStore).toEqual([remote[1]]);
  });

  it('does nothing for cards that are already in sync', () => {
    const same = card('q1', 2, '2026-10-30T10:00:00Z');

    expect(mergeCards([same], [{ ...same }])).toEqual({ toUpload: [], toStore: [] });
  });

  it('treats a local card without timestamp (saved before sync existed) as the oldest', () => {
    const { toUpload, toStore } = mergeCards([card('q1', 4)], [card('q1', 2, '2026-10-01T00:00:00Z')]);

    expect(toUpload).toEqual([]);
    expect(toStore).toEqual([card('q1', 2, '2026-10-01T00:00:00Z')]);
  });

  it('compares instants, not strings, so time zone offsets do not fool it', () => {
    // 10:00+02:00 is 08:00Z: earlier than 09:00Z even though it sorts after it as text.
    const { toUpload, toStore } = mergeCards(
      [card('q1', 4, '2026-10-30T10:00:00+02:00')],
      [card('q1', 2, '2026-10-30T09:00:00Z')],
    );

    expect(toUpload).toEqual([]);
    expect(toStore).toEqual([card('q1', 2, '2026-10-30T09:00:00Z')]);
  });
});
