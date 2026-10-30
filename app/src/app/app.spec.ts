import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the app name in the header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const header = (fixture.nativeElement as HTMLElement).querySelector('header');

    expect(header?.textContent).toContain('Mi Academia');
  });

  it('hosts the router outlet inside main', () => {
    const fixture = TestBed.createComponent(App);
    const main = (fixture.nativeElement as HTMLElement).querySelector('main');

    expect(main?.querySelector('router-outlet')).not.toBeNull();
  });
});
