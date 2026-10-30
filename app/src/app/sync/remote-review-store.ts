import { Injectable, inject } from '@angular/core';
import { CardState } from '../review/leitner';
import { SupabaseClientProvider } from './supabase-client';

/** Port: the server-side copy of review progress. */
// The factory runs at injection time, after this module (and SupabaseReviewStore below) is evaluated.
@Injectable({ providedIn: 'root', useFactory: () => inject(SupabaseReviewStore) })
export abstract class RemoteReviewStore {
  abstract fetchAll(userId: string): Promise<CardState[]>;
  abstract upsert(userId: string, cards: CardState[]): Promise<void>;
}

interface ReviewCardRow {
  user_id: string;
  question_id: string;
  box: number;
  due: string;
  updated_at: string;
}

/** Adapter for the review_cards table (supabase/migrations). RLS limits every query to the signed-in user. */
@Injectable({ providedIn: 'root' })
export class SupabaseReviewStore extends RemoteReviewStore {
  private readonly supabase = inject(SupabaseClientProvider);

  async fetchAll(): Promise<CardState[]> {
    const client = await this.requireClient();
    const { data, error } = await client.from('review_cards').select('question_id, box, due, updated_at');
    if (error) throw error;
    return (data as Omit<ReviewCardRow, 'user_id'>[]).map((row) => ({
      questionId: row.question_id,
      box: row.box,
      due: row.due,
      updatedAt: row.updated_at,
    }));
  }

  async upsert(userId: string, cards: CardState[]): Promise<void> {
    if (cards.length === 0) return;
    const client = await this.requireClient();
    const rows: ReviewCardRow[] = cards.map((card) => ({
      user_id: userId,
      question_id: card.questionId,
      box: card.box,
      due: card.due,
      updated_at: card.updatedAt ?? new Date(0).toISOString(),
    }));
    const { error } = await client.from('review_cards').upsert(rows, { onConflict: 'user_id,question_id' });
    if (error) throw error;
  }

  private async requireClient() {
    const client = await this.supabase.get();
    if (!client) throw new Error('Supabase is not configured');
    return client;
  }
}

