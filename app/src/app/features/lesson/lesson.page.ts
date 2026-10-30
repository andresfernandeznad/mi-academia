import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../content/content.service';
import { LessonQuiz } from '../../quiz/lesson-quiz';

@Component({
  selector: 'app-lesson-page',
  imports: [RouterLink, LessonQuiz],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './lesson.page.scss',
  template: `
    @if (lesson.error()) {
      <p class="state">Lección no encontrada.</p>
      <a class="back" [routerLink]="['/m', moduleId()]">← Volver al módulo</a>
    } @else if (lesson.value(); as lesson) {
      <header>
        <h1>{{ lesson.title }}</h1>
        <p class="meta">{{ lesson.minutes }} min de lectura</p>
      </header>
      <!-- Trusted HTML rendered from our own Markdown at build time; Angular still sanitizes it. -->
      <article class="prose" [innerHTML]="lesson.html"></article>
      <app-lesson-quiz [questions]="lesson.questions" />
      <nav class="pager">
        <a [routerLink]="['/m', moduleId()]">← Módulo</a>
        @if (previous(); as previous) {
          <a [routerLink]="['/m', moduleId(), previous.id]">Anterior: {{ previous.title }}</a>
        }
        @if (next(); as next) {
          <a class="primary" [routerLink]="['/m', moduleId(), next.id]">Siguiente: {{ next.title }}</a>
        }
      </nav>
    } @else {
      <p class="state">Cargando…</p>
    }
  `,
})
export class LessonPage {
  /** Bound from the :moduleId and :lessonId route params. */
  readonly moduleId = input.required<string>();
  readonly lessonId = input.required<string>();

  private readonly content = inject(ContentService);
  protected readonly lesson = this.content.lesson(this.moduleId, this.lessonId);

  private readonly module = this.content.module(this.moduleId);
  private readonly siblings = computed(() => this.module()?.lessons ?? []);
  private readonly position = computed(() => this.siblings().findIndex((l) => l.id === this.lessonId()));
  protected readonly previous = computed(() => (this.position() > 0 ? this.siblings()[this.position() - 1] : undefined));
  protected readonly next = computed(() =>
    this.position() >= 0 ? this.siblings()[this.position() + 1] : undefined,
  );
}
