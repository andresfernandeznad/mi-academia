import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../content/content.service';
import { ProgressService } from '../../progress/progress.service';

@Component({
  selector: 'app-module-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './module.page.scss',
  template: `
    @if (content.index.isLoading()) {
      <p class="state">Cargando el módulo…</p>
    } @else if (module(); as module) {
      <a class="back" routerLink="/">← Roadmap</a>
      <div class="sheet">
        <h1 class="page-title">{{ module.title }}</h1>
        @if (module.description) {
          <p class="description">{{ module.description }}</p>
        }
        @let done = progress.ofModule(module);
        <div class="progress">
          <p class="progress-label meta">{{ done.done }} de {{ done.total }} lecciones completadas</p>
          <span class="bar" aria-hidden="true">
            <span class="bar-fill" [style.width.%]="(done.done / done.total) * 100"></span>
          </span>
        </div>
        <ol class="rows">
          @for (lesson of module.lessons; track lesson.id; let i = $index) {
            @let completed = progress.isCompleted(lesson);
            <li>
              <a class="row" [class.done]="completed" [routerLink]="['/m', module.id, lesson.id]">
                @if (completed) {
                  <span class="index"><span aria-hidden="true">✓</span><span class="visually-hidden">Completada</span></span>
                } @else {
                  <span class="index">{{ i + 1 < 10 ? '0' : '' }}{{ i + 1 }}</span>
                }
                <span class="title">{{ lesson.title }}</span>
                <span class="aside">{{ lesson.minutes }} min</span>
              </a>
            </li>
          }
        </ol>
      </div>
    } @else {
      <p class="state">Ese módulo no existe. Vuelve al roadmap para elegir otro.</p>
      <a class="back" routerLink="/">← Roadmap</a>
    }
  `,
})
export class ModulePage {
  /** Bound from the :moduleId route param. */
  readonly moduleId = input.required<string>();

  protected readonly content = inject(ContentService);
  protected readonly module = this.content.module(this.moduleId);
  protected readonly progress = inject(ProgressService);
}
