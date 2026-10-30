import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ReviewService } from './review/review.service';

@Component({
  imports: [RouterOutlet, RouterLink],
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
  protected readonly dueCount = computed(() => this.reviews.due().length);
}
