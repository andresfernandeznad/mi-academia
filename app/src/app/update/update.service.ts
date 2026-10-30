import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

/**
 * The service worker serves the cached app first (instant, offline) and downloads a new deploy in
 * the background; without this, the new version only shows up on the next launch.
 * SwUpdate is optional: it is absent in unit tests and disabled on the dev server.
 */
@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly updates = inject(SwUpdate, { optional: true });
  private readonly document = inject(DOCUMENT);

  /** A new version is downloaded and will run after a reload. */
  readonly available = signal(false);

  constructor() {
    if (!this.updates?.isEnabled) return;
    const subscription = this.updates.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') this.available.set(true);
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }

  /** Look for a new deploy now, e.g. when an installed app that stayed open comes back. */
  async check(): Promise<void> {
    if (!this.updates?.isEnabled) return;
    try {
      await this.updates.checkForUpdate();
    } catch {
      // Offline or the server is unreachable: try again next time.
    }
  }

  reload(): void {
    this.document.location.reload();
  }
}
