import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canMatch: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'announcements',
        loadComponent: () =>
          import(
            './features/announcements/announcements-list/announcements-list.component'
          ).then((m) => m.AnnouncementsListComponent),
      },
      {
        path: 'announcements/:id',
        loadComponent: () =>
          import(
            './features/announcements/announcement-detail/announcement-detail.component'
          ).then((m) => m.AnnouncementDetailComponent),
      },
      {
        path: 'complaints',
        loadComponent: () =>
          import(
            './features/complaints/complaints-list/complaints-list.component'
          ).then((m) => m.ComplaintsListComponent),
      },
      {
        path: 'complaints/new',
        loadComponent: () =>
          import(
            './features/complaints/complaint-submit/complaint-submit.component'
          ).then((m) => m.ComplaintSubmitComponent),
      },
      {
        path: 'complaints/:id',
        loadComponent: () =>
          import(
            './features/complaints/complaint-detail/complaint-detail.component'
          ).then((m) => m.ComplaintDetailComponent),
      },
      {
        path: 'parliamentarians',
        loadComponent: () =>
          import(
            './features/parliamentarians/parliamentarians-list/parliamentarians-list.component'
          ).then((m) => m.ParliamentariansListComponent),
      },
      {
        path: 'parliamentarians/:id',
        loadComponent: () =>
          import(
            './features/parliamentarians/parliamentarian-detail/parliamentarian-detail.component'
          ).then((m) => m.ParliamentarianDetailComponent),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/projects-list/projects-list.component').then(
            (m) => m.ProjectsListComponent
          ),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/projects/project-detail/project-detail.component').then(
            (m) => m.ProjectDetailComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
