import { InjectionToken } from '@angular/core';
import { localDate } from './leitner';

/** Current local calendar day ("YYYY-MM-DD"). A token so tests can travel in time. */
export const TODAY = new InjectionToken<() => string>('TODAY', {
  providedIn: 'root',
  factory: () => () => localDate(),
});
