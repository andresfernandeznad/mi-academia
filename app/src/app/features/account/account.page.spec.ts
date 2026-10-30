import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AccountUser, AuthService } from '../../sync/auth.service';
import { SyncService, SyncStatus } from '../../sync/sync.service';
import { AccountPage } from './account.page';

describe('AccountPage', () => {
  let fixture: ComponentFixture<AccountPage>;
  let calls: string[];
  const configured = signal(true);
  const user = signal<AccountUser | null>(null);
  const error = signal<string | null>(null);
  const status = signal<SyncStatus>('signed-out');
  const lastSyncedAt = signal<string | null>(null);

  const render = async () => {
    calls = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { configured, user, error, signIn: async () => calls.push('signIn'), signOut: async () => calls.push('signOut') },
        },
        { provide: SyncService, useValue: { status, lastSyncedAt, syncNow: async () => calls.push('syncNow') } },
      ],
    });
    fixture = TestBed.createComponent(AccountPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  const click = async (el: HTMLElement, label: string) => {
    Array.from(el.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === label)!
      .click();
    await fixture.whenStable();
  };

  beforeEach(() => {
    configured.set(true);
    user.set(null);
    error.set(null);
    status.set('signed-out');
    lastSyncedAt.set(null);
  });

  it('explains that progress stays on this device when sync is not configured', async () => {
    configured.set(false);
    status.set('disabled');
    const el = await render();

    expect(el.textContent).toContain('solo en este dispositivo');
    expect(el.querySelector('button')).toBeNull();
  });

  it('offers to sign in with GitHub when signed out', async () => {
    const el = await render();

    await click(el, 'Entrar con GitHub');

    expect(calls).toEqual(['signIn']);
  });

  it('shows who is signed in and when progress was last synced', async () => {
    user.set({ id: 'u1', login: 'andres', avatarUrl: null });
    status.set('synced');
    lastSyncedAt.set('2026-10-30T10:05:00.000Z');
    const el = await render();

    expect(el.textContent).toContain('@andres');
    expect(el.querySelector('[role=status]')?.textContent).toMatch(/Sincronizado a las \d{2}:\d{2}/);
  });

  it('reassures that progress is safe when sync fails, and lets the learner retry or sign out', async () => {
    user.set({ id: 'u1', login: 'andres', avatarUrl: null });
    status.set('error');
    const el = await render();

    expect(el.querySelector('[role=status]')?.textContent).toContain('sigue guardado en este dispositivo');
    await click(el, 'Sincronizar ahora');
    await click(el, 'Salir');
    expect(calls).toEqual(['syncNow', 'signOut']);
  });

  it('explains the offline wait', async () => {
    user.set({ id: 'u1', login: 'andres', avatarUrl: null });
    status.set('offline');
    const el = await render();

    expect(el.querySelector('[role=status]')?.textContent).toContain('Sin conexión');
  });
});
