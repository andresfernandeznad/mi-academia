import { InjectionToken } from '@angular/core';

export interface SupabaseConfig {
  /** Project URL, e.g. https://abcd1234.supabase.co. Empty disables login and sync. */
  url: string;
  /**
   * The project's public anon (publishable) key. It is meant to ship in the frontend: what protects
   * the data is Row Level Security (supabase/migrations). Never put the service_role key here.
   */
  anonKey: string;
}

export const SUPABASE_CONFIG = new InjectionToken<SupabaseConfig>('SUPABASE_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    url: 'https://ffrkjuayuwfpoavhsogn.supabase.co',
    anonKey: 'sb_publishable_LluGR7TUQOfdbavcc9X3Ow_0FAq7Jji',
  }),
});
