import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'heroes/new',
    loadComponent: () =>
      import('./heroes/pages/hero-form/hero-form').then(
        (component) => component.HeroForm,
      ),
  },
  {
    path: 'heroes/:id/edit',
    loadComponent: () =>
      import('./heroes/pages/hero-form/hero-form').then(
        (component) => component.HeroForm,
      ),
  },
  {
    path: 'heroes',
    loadComponent: () =>
      import('./heroes/pages/hero-list/hero-list').then(
        (component) => component.HeroList,
      ),
  },
  {
    path: '',
    redirectTo: 'heroes',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'heroes',
  },
];
