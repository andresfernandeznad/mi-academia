import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../content/content.service';
import { ProgressService } from '../../progress/progress.service';
import { StudyDaysService } from '../../study-days/study-days.service';

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

        <div class="study">
          <p class="study-summary meta">
            Racha: {{ studyDays.streak() }} {{ studyDays.streak() === 1 ? 'día' : 'días' }} ·
            {{ studyDays.studiedThisWeek() }} de {{ weeklyGoal }} días esta semana
          </p>
          <ol class="week">
            @for (day of studyDays.week(); track day.day; let i = $index) {
              <li
                [class.studied]="day.studied"
                [class.today]="day.isToday"
                [attr.aria-label]="weekDayNames[i] + ': ' + (day.studied ? 'estudiado' : 'sin estudiar')"
              >
                <span aria-hidden="true">{{ weekDayLetters[i] }}</span>
              </li>
            }
          </ol>
        </div>

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
  protected readonly studyDays = inject(StudyDaysService);

  /** The success criterion: study at least 5 days a week. */
  protected readonly weeklyGoal = 5;
  protected readonly weekDayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  // "X" is the usual abbreviation for miércoles in Spanish calendars, so it is not confused with martes.
  protected readonly weekDayLetters = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  protected readonly totals = computed(() => {
    const modules = this.content.index.value()?.phases.flatMap((phase) => phase.modules) ?? [];
    return { modules: modules.length, hours: modules.reduce((sum, module) => sum + module.hours, 0) };
  });
}
