import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../content/content.service';
import { ProgressService } from '../../progress/progress.service';

@Component({
  selector: 'app-roadmap-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './roadmap.page.scss',
  template: `
    @if (content.index.error()) {
      <p class="state">No se pudo cargar el contenido. Comprueba la conexión y recarga la página.</p>
    } @else if (content.index.value(); as index) {
      <div class="sheet">
        <h1 class="page-title">{{ index.title }}</h1>
        <p class="summary meta">{{ totals().modules }} módulos, {{ totals().hours }} horas estimadas</p>

        @if (progress.next(); as next) {
          <a class="button primary continue" [routerLink]="['/m', next.module.id, next.lesson.id]">
            <span class="continue-label">Continuar</span>
            <span class="continue-title">{{ next.lesson.title }}</span>
          </a>
        }

        @for (phase of index.phases; track phase.id; let p = $index) {
          <section>
            <h2>{{ phase.title }}</h2>
            <ol class="rows">
              @for (module of phase.modules; track module.id; let m = $index) {
                <li>
                  @if (module.available) {
                    @let done = progress.ofModule(module);
                    <a class="row" [routerLink]="['/m', module.id]">
                      <span class="index">{{ p }}.{{ m + 1 }}</span>
                      <span>
                        <span class="title">{{ module.title }}</span>
                        <span class="sub">
                          {{ done.done }} de {{ done.total }} {{ done.total === 1 ? 'lección' : 'lecciones' }}
                        </span>
                        <span class="bar" aria-hidden="true">
                          <span class="bar-fill" [style.width.%]="(done.done / done.total) * 100"></span>
                        </span>
                      </span>
                      <span class="aside">{{ module.hours }} h</span>
                    </a>
                  } @else {
                    <div class="row unavailable">
                      <span class="index">{{ p }}.{{ m + 1 }}</span>
                      <span>
                        <span class="title">{{ module.title }}</span>
                        <span class="sub">Próximamente</span>
                      </span>
                      <span class="aside">{{ module.hours }} h</span>
                    </div>
                  }
                </li>
              }
            </ol>
          </section>
        }
      </div>
    } @else {
      <p class="state">Cargando el roadmap…</p>
    }
  `,
})
export class RoadmapPage {
  protected readonly content = inject(ContentService);
  protected readonly progress = inject(ProgressService);

  protected readonly totals = computed(() => {
    const modules = this.content.index.value()?.phases.flatMap((phase) => phase.modules) ?? [];
    return { modules: modules.length, hours: modules.reduce((sum, module) => sum + module.hours, 0) };
  });
}
