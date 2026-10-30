import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ReviewService } from './review/review.service';
import { ThemePreference, ThemeService } from './theme/theme.service';
import { SyncService } from './sync/sync.service';
import { UpdateService } from './update/update.service';

const THEME_NAMES: Record<ThemePreference, string> = { system: 'sistema', light: 'claro', dark: 'noche' };
const NEXT_THEME: Record<ThemePreference, ThemePreference> = { system: 'light', light: 'dark', dark: 'system' };

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  host: {
    // An installed PWA can stay open for days: when it comes back, recheck the day and the deploy.
    '(document:visibilitychange)': 'onVisible()',
  },
})
export class App {
  protected readonly reviews = inject(ReviewService);
  protected readonly updates = inject(UpdateService);
  /** Injected here so sync starts with the app, not when the account page is first opened. */
  private readonly sync = inject(SyncService);
  protected readonly theme = inject(ThemeService);
  protected readonly dueCount = computed(() => this.reviews.due().length);

  /** Says the current theme and what a tap does, since the icon alone cannot. */
  protected readonly themeLabel = computed(() => {
    const current = this.theme.preference();
    return `Tema: ${THEME_NAMES[current]}. Cambiar a ${THEME_NAMES[NEXT_THEME[current]]}`;
  });

  protected onVisible(): void {
    if (document.visibilityState !== 'visible') return;
    this.reviews.refreshToday();
    void this.updates.check();
    this.sync.syncSoon();
  }
}
