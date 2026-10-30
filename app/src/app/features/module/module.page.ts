import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../content/content.service';

@Component({
  selector: 'app-module-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './module.page.scss',
  template: `
    @if (content.index.isLoading()) {
      <p class="state">Cargando…</p>
    } @else if (module(); as module) {
      <a class="back" routerLink="/">← Roadmap</a>
      <h1>{{ module.title }}</h1>
      @if (module.description) {
        <p class="description">{{ module.description }}</p>
      }
      <ol class="lessons">
        @for (lesson of module.lessons; track lesson.id; let i = $index) {
          <li>
            <a class="card" [routerLink]="['/m', module.id, lesson.id]">
              <span class="title">{{ i + 1 }}. {{ lesson.title }}</span>
              <span class="meta">{{ lesson.minutes }} min</span>
            </a>
          </li>
        }
      </ol>
    } @else {
      <p class="state">Módulo no encontrado.</p>
      <a class="back" routerLink="/">← Volver al roadmap</a>
    }
  `,
})
export class ModulePage {
  /** Bound from the :moduleId route param. */
  readonly moduleId = input.required<string>();

  protected readonly content = inject(ContentService);
  protected readonly module = this.content.module(this.moduleId);
}
