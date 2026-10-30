import { ApplicationConfig, isDevMode, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    // Route params arrive as component inputs; a new lesson always starts at the top.
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    // IndexedDB holds the only offline copy of progress, and browsers may evict site storage under
    // pressure (iOS Safari also after weeks without visits). Ask to keep it; denial is fine, so don't wait.
    provideAppInitializer(() => {
      navigator.storage?.persist?.().catch(() => undefined);
    }),
  ],
};
