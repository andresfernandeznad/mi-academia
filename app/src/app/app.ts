import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ReviewService } from './review/review.service';
import { ThemePreference, ThemeService } from './theme/theme.service';

const THEME_NAMES: Record<ThemePreference, string> = { system: 'sistema', light: 'claro', dark: 'noche' };
const NEXT_THEME: Record<ThemePreference, ThemePreference> = { system: 'light', light: 'dark', dark: 'system' };

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  host: {
    // An installed PWA can stay open across midnight; recheck the day when it comes back.
    '(document:visibilitychange)': 'reviews.refreshToday()',
  },
})
export class App {
  protected readonly reviews = inject(ReviewService);
  protected readonly theme = inject(ThemeService);
  protected readonly dueCount = computed(() => this.reviews.due().length);

  /** Says the current theme and what a tap does, since the icon alone cannot. */
  protected readonly themeLabel = computed(() => {
    const current = this.theme.preference();
    return `Tema: ${THEME_NAMES[current]}. Cambiar a ${THEME_NAMES[NEXT_THEME[current]]}`;
  });
}
