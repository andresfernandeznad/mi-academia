import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { SupabaseClientProvider } from './supabase-client';

export interface AccountUser {
  id: string;
  login: string;
  avatarUrl: string | null;
}

/** GitHub login through Supabase Auth. Without Supabase configured, everything stays signed out. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientProvider);
  private readonly document = inject(DOCUMENT);

  readonly configured = signal(this.supabase.configured);
  readonly user = signal<AccountUser | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.init();
  }

  async signIn(): Promise<void> {
    const client = await this.supabase.get();
    if (!client) return;
    this.error.set(null);
    const { error } = await client.auth.signInWithOAuth({
      provider: 'github',
      // Back to the app's root under its base href (GitHub Pages serves it from /mi-academia/).
      options: { redirectTo: this.document.baseURI },
    });
    if (error) this.error.set('No se pudo abrir el login de GitHub. Comprueba la conexión e inténtalo de nuevo.');
  }

  async signOut(): Promise<void> {
    const client = await this.supabase.get();
    await client?.auth.signOut();
  }

  private async init(): Promise<void> {
    const client = await this.supabase.get();
    if (!client) return;
    // Also fires INITIAL_SESSION on start, including right after the OAuth redirect lands.
    client.auth.onAuthStateChange((_event, session) => this.user.set(session ? toAccountUser(session.user) : null));
  }
}

function toAccountUser(user: User): AccountUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    login: String(meta['user_name'] ?? meta['preferred_username'] ?? user.email ?? 'GitHub'),
    avatarUrl: typeof meta['avatar_url'] === 'string' ? meta['avatar_url'] : null,
  };
}
