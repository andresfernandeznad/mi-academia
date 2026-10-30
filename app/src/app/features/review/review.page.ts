import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../content/content.service';
import { Grade } from '../../quiz/grading';
import { QuestionCard } from '../../quiz/question-card';
import { Rating } from '../../review/leitner';
import { ReviewService } from '../../review/review.service';

interface RatingOption {
  rating: Rating;
  label: string;
}

/** A wrong auto-graded answer can only be "failed"; being honest with yourself is the point of the review. */
const RATINGS: Record<Grade, RatingOption[]> = {
  correct: [
    { rating: 'easy', label: 'Fácil' },
    { rating: 'unsure', label: 'Dudoso' },
  ],
  incorrect: [{ rating: 'failed', label: 'Siguiente' }],
  'self-assessed': [
    { rating: 'easy', label: 'Fácil' },
    { rating: 'unsure', label: 'Dudoso' },
    { rating: 'failed', label: 'Fallado' },
  ],
};

@Component({
  selector: 'app-review-page',
  imports: [RouterLink, QuestionCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './review.page.scss',
  template: `
    <h1>Repaso de hoy</h1>
    @if (questions.error()) {
      <p class="state">No se pudieron cargar las preguntas.</p>
    } @else if (questions.isLoading()) {
      <p class="state">Cargando…</p>
    } @else if (current(); as question) {
      <p class="meta">
        Quedan {{ pending().length }} · De «{{ question.lessonTitle }}»
      </p>
      <app-question-card [question]="question" (answered)="grade.set($event.grade)" />
      @if (grade(); as g) {
        <div class="rating">
          @if (g !== 'incorrect') {
            <p class="meta">¿Cómo te ha resultado?</p>
          }
          @for (option of ratings[g]; track option.rating) {
            <button type="button" (click)="rate(question.id, option.rating)">{{ option.label }}</button>
          }
        </div>
      }
    } @else {
      <p class="state">No tienes preguntas pendientes para hoy.</p>
      <a class="back" routerLink="/">← Seguir con el roadmap</a>
    }
  `,
})
export class ReviewPage {
  private readonly reviews = inject(ReviewService);
  protected readonly questions = inject(ContentService).reviewQuestions();
  protected readonly ratings = RATINGS;

  private readonly byId = computed(
    () => new Map((this.questions.value() ?? []).map((question) => [question.id, question])),
  );

  /** Due cards whose question still exists in the content (an id may disappear after an edit). */
  protected readonly pending = computed(() => this.reviews.due().filter((card) => this.byId().has(card.questionId)));
  protected readonly current = computed(() => {
    const [first] = this.pending();
    return first && this.byId().get(first.questionId);
  });

  /** Grade of the answer to the current question; resets when the next question shows up. */
  protected readonly grade = linkedSignal<unknown, Grade | undefined>({
    source: this.current,
    computation: () => undefined,
  });

  constructor() {
    this.reviews.refreshToday();
  }

  protected async rate(questionId: string, rating: Rating): Promise<void> {
    await this.reviews.rate(questionId, rating);
  }
}

