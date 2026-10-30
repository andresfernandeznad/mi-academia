import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../content/content.service';

@Component({
  selector: 'app-roadmap-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './roadmap.page.scss',
  template: `
    @if (content.index.error()) {
      <p class="state">No se pudo cargar el contenido. Revisa la conexión y vuelve a intentarlo.</p>
    } @else if (content.index.value(); as index) {
      <h1>{{ index.title }}</h1>
      @for (phase of index.phases; track phase.id) {
        <section>
          <h2>{{ phase.title }}</h2>
          <ul class="modules">
            @for (module of phase.modules; track module.id) {
              <li>
                @if (module.available) {
                  <a class="card" [routerLink]="['/m', module.id]">
                    <span class="title">{{ module.title }}</span>
                    <span class="meta">
                      {{ module.lessons.length }} {{ module.lessons.length === 1 ? 'lección' : 'lecciones' }} ·
                      {{ module.hours }} h
                    </span>
                  </a>
                } @else {
                  <div class="card disabled">
                    <span class="title">{{ module.title }}</span>
                    <span class="meta">Próximamente · {{ module.hours }} h</span>
                  </div>
                }
              </li>
            }
          </ul>
        </section>
      }
    } @else {
      <p class="state">Cargando…</p>
    }
  `,
})
export class RoadmapPage {
  protected readonly content = inject(ContentService);
}
