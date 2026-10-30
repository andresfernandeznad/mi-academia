import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { Question } from '../content/content.model';
import { Grade, grade, shuffle } from './grading';

export interface QuestionAnswer {
  questionId: string;
  grade: Grade;
}

interface Choice {
  /** Option index, or 1-based line number for find-the-bug. */
  value: number;
  label: string;
}

@Component({
  selector: 'app-question-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './question-card.scss',
  template: `
    @let q = question();
    <p class="prompt">{{ q.prompt }}</p>

    @if (q.type === 'find-the-bug') {
      <div class="code-lines">
        @for (line of choices(); track line.value) {
          <button
            type="button"
            [attr.aria-label]="'Línea ' + line.value"
            [class]="stateOf(line.value)"
            [disabled]="isAnswered()"
            (click)="choose(line.value)"
          >
            <span class="line-number">{{ line.value }}</span><code>{{ line.label }}</code>
          </button>
        }
      </div>
    } @else {
      @if (q.code) {
        <pre><code>{{ q.code }}</code></pre>
      }
      <div class="options">
        @for (option of choices(); track option.value) {
          <button type="button" [class]="stateOf(option.value)" [disabled]="isAnswered()" (click)="choose(option.value)">
            {{ option.label }}
          </button>
        }
      </div>
    }

    <div role="status" class="feedback">
      @switch (result()) {
        @case ('correct') {
          <p class="verdict correct">¡Correcto!</p>
        }
        @case ('incorrect') {
          <p class="verdict incorrect">
            Incorrecto.
            @if (q.type === 'find-the-bug') {
              El fallo está en la línea {{ q.answer }}.
            }
          </p>
        }
        @case ('self-assessed') {
          <p class="verdict">Respuesta recomendada: {{ recommended() }}</p>
        }
      }
      @if (isAnswered()) {
        <p class="explanation">{{ q.explanation }}</p>
      }
    </div>
  `,
})
export class QuestionCard {
  readonly question = input.required<Question>();
  readonly answered = output<QuestionAnswer>();

  /** Resets automatically when a different question is bound. */
  private readonly chosen = linkedSignal<Question, number | undefined>({
    source: this.question,
    computation: () => undefined,
  });

  protected readonly isAnswered = computed(() => this.chosen() !== undefined);
  protected readonly result = computed(() => {
    const chosen = this.chosen();
    return chosen === undefined ? undefined : grade(this.question(), chosen);
  });

  protected readonly choices = computed<Choice[]>(() => {
    const q = this.question();
    if (q.type === 'find-the-bug') {
      return q.code.split('\n').map((label, i) => ({ value: i + 1, label }));
    }
    return shuffle(q.options.map((label, value) => ({ value, label })));
  });

  protected readonly recommended = computed(() => {
    const q = this.question();
    return q.type === 'find-the-bug' ? undefined : q.options[q.answer];
  });

  protected choose(value: number): void {
    if (this.isAnswered()) return;
    this.chosen.set(value);
    this.answered.emit({ questionId: this.question().id, grade: grade(this.question(), value) });
  }

  protected stateOf(value: number): string {
    if (!this.isAnswered()) return '';
    if (value === this.question().answer) return 'is-answer';
    if (value !== this.chosen()) return '';
    return this.question().type === 'design-decision' ? 'is-chosen' : 'is-wrong';
  }
}
