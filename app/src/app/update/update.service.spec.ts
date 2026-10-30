import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { UpdateService } from './update.service';

describe('UpdateService', () => {
  let events: Subject<VersionEvent>;
  let checks: number;

  const create = (isEnabled: boolean) => {
    events = new Subject<VersionEvent>();
    checks = 0;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled,
            versionUpdates: events,
            checkForUpdate: async () => {
              checks++;
              return false;
            },
          },
        },
      ],
    });
    return TestBed.inject(UpdateService);
  };

  const version = { hash: 'abc' };

  it('flags an update only once the new version is downloaded and ready', () => {
    const service = create(true);

    events.next({ type: 'VERSION_DETECTED', version });
    expect(service.available()).toBe(false);

    events.next({ type: 'VERSION_READY', currentVersion: { hash: 'old' }, latestVersion: version });
    expect(service.available()).toBe(true);
  });

  it('asks the service worker to look for a new version', async () => {
    const service = create(true);

    await service.check();

    expect(checks).toBe(1);
  });

  it('does nothing when the service worker is disabled (dev server, unsupported browser)', async () => {
    const service = create(false);

    await service.check();

    expect(checks).toBe(0);
    expect(service.available()).toBe(false);
  });

  it('works without a service worker provider at all', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(UpdateService);

    await service.check();

    expect(service.available()).toBe(false);
  });
});
