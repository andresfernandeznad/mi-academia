import { Injectable, inject } from '@angular/core';
import { SupabaseClientProvider } from './supabase-client';

/** Port: the server-side copy of the study days. */
// The factory runs at injection time, after this module (and SupabaseStudyDaysStore below) is evaluated.
@Injectable({ providedIn: 'root', useFactory: () => inject(SupabaseStudyDaysStore) })
export abstract class RemoteStudyDaysStore {
  abstract fetchAll(userId: string): Promise<string[]>;
  abstract insert(userId: string, days: string[]): Promise<void>;
}

/** Adapter for the study_days table (supabase/migrations). RLS limits every query to the signed-in user. */
@Injectable({ providedIn: 'root' })
export class SupabaseStudyDaysStore extends RemoteStudyDaysStore {
  private readonly supabase = inject(SupabaseClientProvider);

  async fetchAll(): Promise<string[]> {
    const client = await this.requireClient();
    const { data, error } = await client.from('study_days').select('day');
    if (error) throw error;
    return (data as { day: string }[]).map((row) => row.day);
  }

  /** Days never change once stored, so a day that is already there is skipped, not updated. */
  async insert(userId: string, days: string[]): Promise<void> {
    if (days.length === 0) return;
    const client = await this.requireClient();
    const rows = days.map((day) => ({ user_id: userId, day }));
    const { error } = await client.from('study_days').upsert(rows, { onConflict: 'user_id,day', ignoreDuplicates: true });
    if (error) throw error;
  }

  private async requireClient() {
    const client = await this.supabase.get();
    if (!client) throw new Error('Supabase is not configured');
    return client;
  }
}
