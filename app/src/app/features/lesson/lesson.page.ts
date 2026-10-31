import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../content/content.service';
import { LessonQuiz } from '../../quiz/lesson-quiz';
import { QuestionAnswer } from '../../quiz/question-card';
import { ReviewService } from '../../review/review.service';
import { StudyDaysService } from '../../study-days/study-days.service';

@Component({
  selector: 'app-lesson-page',
  imports: [RouterLink, LessonQuiz],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './lesson.page.scss',
  template: `
    @if (lesson.error()) {
      <p class="state">Lección no encontrada. Puede que la hayan renombrado: búscala en el módulo.</p>
      <a class="back" [routerLink]="['/m', moduleId()]">← Volver al módulo</a>
    } @else if (lesson.value(); as lesson) {
      <a class="back" [routerLink]="['/m', moduleId()]">← Índice de {{ module()?.title ?? 'el módulo' }}</a>
      <div class="sheet">
        <header>
          <p class="meta">
            @if (position() >= 0) {
              <span>Lección {{ position() + 1 }} de {{ siblings().length }}</span>
            }
            <span>{{ lesson.minutes }} min de lectura</span>
          </p>
          <h1 class="page-title">{{ lesson.title }}</h1>
        </header>
        <!-- Trusted HTML rendered from our own Markdown at build time; Angular still sanitizes it. -->
        <article class="prose" [innerHTML]="lesson.html"></article>
        <app-lesson-quiz [questions]="lesson.questions" (answered)="onAnswered($event)" />
      </div>
      <nav class="pager" aria-label="Lecciones">
        <a class="button" [routerLink]="['/m', moduleId()]">Índice</a>
        @if (previous(); as previous) {
          <a class="button" [routerLink]="['/m', moduleId(), previous.id]">← Anterior</a>
        }
        @if (next(); as next) {
          <a class="button primary" [routerLink]="['/m', moduleId(), next.id]">Siguiente: {{ next.title }} →</a>
        }
      </nav>
    } @else {
      <p class="state">Cargando la lección…</p>
    }
  `,
})
export class LessonPage {
  /** Bound from the :moduleId and :lessonId route params. */
  readonly moduleId = input.required<string>();
  readonly lessonId = input.required<string>();

  private readonly content = inject(ContentService);
  private readonly reviews = inject(ReviewService);
  private readonly studyDays = inject(StudyDaysService);
  protected readonly lesson = this.content.lesson(this.moduleId, this.lessonId);

  protected readonly module = this.content.module(this.moduleId);
  protected readonly siblings = computed(() => this.module()?.lessons ?? []);
  protected readonly position = computed(() => this.siblings().findIndex((l) => l.id === this.lessonId()));
  protected readonly previous = computed(() => (this.position() > 0 ? this.siblings()[this.position() - 1] : undefined));
  protected readonly next = computed(() =>
    this.position() >= 0 ? this.siblings()[this.position() + 1] : undefined,
  );

  /** Any answer counts as studying today, even on a lesson read before; only the first one creates a card. */
  protected async onAnswered({ questionId, grade }: QuestionAnswer): Promise<void> {
    await Promise.all([this.reviews.recordFirstAnswer(questionId, grade), this.studyDays.markToday()]);
  }
}
