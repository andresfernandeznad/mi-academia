import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';

/** Also read by the inline script in index.html, which applies the theme before Angular boots. */
export const THEME_STORAGE_KEY = 'mi-academia:theme';

const ORDER: ThemePreference[] = ['system', 'light', 'dark'];

/**
 * Light / night mode. "system" leaves <html> unmarked so the CSS follows prefers-color-scheme;
 * an explicit choice sets data-theme and is remembered on this device only (it is a display
 * preference, not progress, so it does not sync).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;

  readonly preference = signal<ThemePreference>(readStored());

  constructor() {
    effect(() => {
      const preference = this.preference();
      if (preference === 'system') {
        delete this.root.dataset['theme'];
      } else {
        this.root.dataset['theme'] = preference;
      }
      try {
        localStorage.setItem(THEME_STORAGE_KEY, preference);
      } catch {
        // Storage blocked (private mode): the choice simply lasts for this visit.
      }
    });
  }

  cycle(): void {
    this.preference.update((current) => ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
  }
}

function readStored(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return ORDER.includes(stored as ThemePreference) ? (stored as ThemePreference) : 'system';
  } catch {
    return 'system';
  }
}
