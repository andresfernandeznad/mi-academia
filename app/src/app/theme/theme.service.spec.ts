import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  const root = document.documentElement;

  const create = () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    return service;
  };

  beforeEach(() => {
    localStorage.clear();
    delete root.dataset['theme'];
  });

  it('follows the system by default and leaves the root unmarked', () => {
    const service = create();

    expect(service.preference()).toBe('system');
    expect(root.dataset['theme']).toBeUndefined();
  });

  it('cycles system → light → dark → system, marking the root', () => {
    const service = create();

    service.cycle();
    TestBed.tick();
    expect(service.preference()).toBe('light');
    expect(root.dataset['theme']).toBe('light');

    service.cycle();
    TestBed.tick();
    expect(root.dataset['theme']).toBe('dark');

    service.cycle();
    TestBed.tick();
    expect(root.dataset['theme']).toBeUndefined();
  });

  it('remembers the choice on this device', () => {
    create().cycle();
    TestBed.tick();

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('restores a saved choice and ignores garbage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(create().preference()).toBe('dark');

    TestBed.resetTestingModule();
    localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(create().preference()).toBe('system');
  });
});
