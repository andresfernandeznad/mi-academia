import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '../../sync/auth.service';
import { SyncService } from '../../sync/sync.service';

@Component({
  selector: 'app-account-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './account.page.scss',
  template: `
    <div class="sheet">
      <h1 class="page-title">Cuenta</h1>

      @if (!auth.configured()) {
        <p class="lead">
          La sincronización no está configurada en esta instalación. Tu progreso se guarda solo en este dispositivo.
        </p>
      } @else if (auth.user(); as user) {
        <div class="identity">
          @if (user.avatarUrl) {
            <img [src]="user.avatarUrl" alt="" width="48" height="48" />
          }
          <div>
            <p class="login">&#64;{{ user.login }}</p>
            <p class="meta">Conectado con GitHub</p>
          </div>
        </div>

        <p class="sync-status" role="status" [attr.data-status]="sync.status()">{{ statusText() }}</p>

        <div class="actions">
          <button type="button" class="button" [disabled]="sync.status() === 'syncing'" (click)="sync.syncNow()">
            Sincronizar ahora
          </button>
          <button type="button" class="button" (click)="auth.signOut()">Salir</button>
        </div>
      } @else {
        <p class="lead">
          Entra con GitHub para guardar tu progreso en la nube y seguir en el móvil o en el ordenador donde lo dejaste.
          Sin cuenta, todo funciona igual pero solo en este dispositivo.
        </p>
        <button type="button" class="button primary" (click)="auth.signIn()">Entrar con GitHub</button>
        @if (auth.error(); as message) {
          <p class="error" role="alert">{{ message }}</p>
        }
      }
    </div>
  `,
})
export class AccountPage {
  protected readonly auth = inject(AuthService);
  protected readonly sync = inject(SyncService);

  protected readonly statusText = computed(() => {
    switch (this.sync.status()) {
      case 'syncing':
        return 'Sincronizando…';
      case 'synced': {
        const at = this.sync.lastSyncedAt();
        return at ? `Sincronizado a las ${new Date(at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : 'Sincronizado';
      }
      case 'offline':
        return 'Sin conexión. Se sincronizará cuando vuelva la conexión.';
      case 'error':
        return 'No se pudo sincronizar. Tu progreso sigue guardado en este dispositivo.';
      default:
        return '';
    }
  });
}
