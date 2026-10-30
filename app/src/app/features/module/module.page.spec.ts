import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { indexFixture } from '../../content/content.fixtures';
import { ModulePage } from './module.page';

describe('ModulePage', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  const open = async (url: string) => {
    harness = await RouterTestingHarness.create(url);
    http.expectOne('content/index.json').flush(indexFixture);
    await harness.fixture.whenStable();
    return harness.routeNativeElement!;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'm/:moduleId', component: ModulePage }], withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows the module title, description and lessons in order', async () => {
    const page = await open('/m/curso-0-java');

    expect(page.querySelector('h1')?.textContent).toContain('Java esencial');
    expect(page.textContent).toContain('Repaso de Java moderno.');
    const links = Array.from(page.querySelectorAll('ol a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/m/curso-0-java/java-hoy', '/m/curso-0-java/tipos']);
    expect(links[0].textContent).toContain('8 min');
  });

  it('tells the user when the module does not exist', async () => {
    const page = await open('/m/no-existe');

    expect(page.textContent).toContain('Módulo no encontrado');
  });
});
