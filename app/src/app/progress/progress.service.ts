import { Injectable, computed, inject } from '@angular/core';
import { ContentService } from '../content/content.service';
import { LessonSummary, ModuleSummary } from '../content/content.model';
import { ReviewService } from '../review/review.service';
import { Progress, isLessonCompleted, moduleProgress, nextLesson } from './progress';

/** Lesson progress as signals, derived from the review cards (see progress.ts). */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly content = inject(ContentService);
  private readonly review = inject(ReviewService);

  private readonly answered = computed(() => new Set(this.review.allCards().map((card) => card.questionId)));

  /** Where "continue" leads; undefined while the index loads or once everything is completed. */
  readonly next = computed(() => {
    const index = this.content.index.value();
    return index && nextLesson(index, this.answered());
  });

  isCompleted(lesson: LessonSummary): boolean {
    return isLessonCompleted(lesson, this.answered());
  }

  ofModule(module: ModuleSummary): Progress {
    return moduleProgress(module, this.answered());
  }
}
