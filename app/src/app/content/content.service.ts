import { Injectable, Signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ContentIndex, Lesson, ModuleSummary, ReviewQuestion } from './content.model';

/**
 * Read-only access to the compiled content under /content.
 * URLs are relative so they resolve against <base href> (GitHub Pages serves the app from a sub-path).
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly index = httpResource<ContentIndex>(() => 'content/index.json');

  private readonly modules = computed(() => this.index.value()?.phases.flatMap((phase) => phase.modules) ?? []);

  module(moduleId: Signal<string>): Signal<ModuleSummary | undefined> {
    return computed(() => this.modules().find((module) => module.id === moduleId()));
  }

  /** Every question with its lesson, for the daily review. Must be called in an injection context. */
  reviewQuestions() {
    return httpResource<ReviewQuestion[]>(() => 'content/questions.json');
  }

  /** Must be called in an injection context (e.g. a component field initializer). */
  lesson(moduleId: Signal<string>, lessonId: Signal<string>) {
    return httpResource<Lesson>(() => `content/${moduleId()}/${lessonId()}.json`);
  }
}
