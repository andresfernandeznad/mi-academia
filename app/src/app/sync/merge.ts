import { CardState } from '../review/leitner';

export interface MergeResult {
  /** Local cards the server lacks or has an older version of. */
  toUpload: CardState[];
  /** Server cards this device lacks or has an older version of. */
  toStore: CardState[];
}

/** Milliseconds since epoch; a card without timestamp predates sync and loses every tie-break. */
const instant = (card: CardState) => (card.updatedAt ? Date.parse(card.updatedAt) : 0);

/**
 * Last write wins, per card. Good enough for one learner on a few devices: the only conflict is
 * answering the same question on two devices while offline, and the later answer is the one to keep.
 */
export function mergeCards(local: readonly CardState[], remote: readonly CardState[]): MergeResult {
  const remoteById = new Map(remote.map((card) => [card.questionId, card]));
  const localIds = new Set(local.map((card) => card.questionId));

  const toUpload = local.filter((card) => {
    const theirs = remoteById.get(card.questionId);
    return !theirs || instant(card) > instant(theirs);
  });

  const localById = new Map(local.map((card) => [card.questionId, card]));
  const toStore = remote.filter((card) => {
    if (!localIds.has(card.questionId)) return true;
    return instant(card) > instant(localById.get(card.questionId)!);
  });

  return { toUpload, toStore };
}
