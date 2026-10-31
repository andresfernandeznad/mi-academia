import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { indexFixture } from '../content/content.fixtures';
import { CardState } from '../review/leitner';
import { InMemoryReviewRepository, ReviewRepository } from '../review/review.repository';
import { ReviewService } from '../review/review.service';
import { ProgressService } from './progress.service';

const card = (questionId: string): CardState => ({ questionId, box: 1, due: '2026-11-01' });

describe('ProgressService', () => {
  const create = async (stored: CardState[]) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReviewRepository, useValue: new InMemoryReviewRepository(stored) },
      ],
    });
    const service = TestBed.inject(ProgressService);
    await TestBed.inject(ReviewService).ready;
    TestBed.tick();
    TestBed.inject(HttpTestingController).expectOne('content/index.json').flush(indexFixture);
    await TestBed.inject(ApplicationRef).whenStable();
    return service;
  };

  const [javaModule] = indexFixture.phases[0].modules;
  const [javaHoy, tipos] = javaModule.lessons;

  it('derives completed lessons from the stored review cards', async () => {
    const service = await create([card('java-hoy-1'), card('java-hoy-2')]);

    expect(service.isCompleted(javaHoy)).toBe(true);
    expect(service.isCompleted(tipos)).toBe(false);
    expect(service.ofModule(javaModule)).toEqual({ done: 1, total: 2 });
    expect(service.next()?.lesson.id).toBe('tipos');
  });

  it('updates as soon as a new answer creates a card', async () => {
    const service = await create([card('java-hoy-1')]);
    expect(service.isCompleted(javaHoy)).toBe(false);

    await TestBed.inject(ReviewService).recordFirstAnswer('java-hoy-2', 'correct');

    expect(service.isCompleted(javaHoy)).toBe(true);
    expect(service.next()?.lesson.id).toBe('tipos');
  });
});
