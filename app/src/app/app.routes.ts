import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/roadmap/roadmap.page').then((m) => m.RoadmapPage) },
  { path: 'm/:moduleId', loadComponent: () => import('./features/module/module.page').then((m) => m.ModulePage) },
  {
    path: 'm/:moduleId/:lessonId',
    loadComponent: () => import('./features/lesson/lesson.page').then((m) => m.LessonPage),
  },
  { path: 'repaso', loadComponent: () => import('./features/review/review.page').then((m) => m.ReviewPage) },
  { path: '**', redirectTo: '' },
];
