import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { Question } from '../content/content.model';
import { Grade } from './grading';
import { QuestionAnswer, QuestionCard } from './question-card';

@Component({
  selector: 'app-lesson-quiz',
  imports: [QuestionCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './lesson-quiz.scss',
  template: `
    @if (questions().length > 0) {
      <section>
        <h2>Comprueba</h2>
        <ol>
          @for (question of questions(); track question.id) {
            <li><app-question-card [question]="question" (answered)="record($event)" /></li>
          }
        </ol>
        @if (summary(); as s) {
          <p class="summary" role="status">
            {{ s.correct }} de {{ s.graded }} correctas
            @if (s.selfAssessed > 0) {
              · {{ s.selfAssessed }} de autoevaluación
            }
          </p>
        }
      </section>
    }
  `,
})
export class LessonQuiz {
  readonly questions = input.required<Question[]>();

  /** Grades by question id; starts empty again whenever the lesson changes. */
  private readonly grades = linkedSignal<Question[], Record<string, Grade>>({
    source: this.questions,
    computation: () => ({}),
  });

  protected readonly summary = computed(() => {
    const grades = this.grades();
    const results = this.questions().map((q) => grades[q.id]);
    if (results.some((g) => g === undefined)) return undefined;

    const graded = results.filter((g) => g !== 'self-assessed');
    return {
      correct: graded.filter((g) => g === 'correct').length,
      graded: graded.length,
      selfAssessed: results.length - graded.length,
    };
  });

  protected record({ questionId, grade }: QuestionAnswer): void {
    this.grades.update((grades) => ({ ...grades, [questionId]: grade }));
  }
}
