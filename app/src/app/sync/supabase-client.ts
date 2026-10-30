import { Injectable, inject } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './supabase.config';

/**
 * Creates the Supabase client on first use. The import is dynamic so supabase-js lives in its own
 * lazy chunk instead of the startup bundle, and is never downloaded when sync is not configured.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseClientProvider {
  private readonly config = inject(SUPABASE_CONFIG);
  private client?: Promise<SupabaseClient | null>;

  readonly configured = Boolean(this.config.url && this.config.anonKey);

  get(): Promise<SupabaseClient | null> {
    if (!this.configured) return Promise.resolve(null);
    this.client ??= import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(this.config.url, this.config.anonKey, {
        auth: {
          // PKCE instead of the default implicit flow: GitHub hands back a one-time code, exchanged
          // with a verifier kept on this device, so no access token ever appears in the URL or history.
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }),
    );
    return this.client;
  }
}
