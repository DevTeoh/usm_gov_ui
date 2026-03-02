import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { ShellComponent } from './layout/shell/shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ComplaintsListComponent } from './features/complaints/complaints-list/complaints-list.component';
import { ComplaintSubmitComponent } from './features/complaints/complaint-submit/complaint-submit.component';
import { ParliamentariansListComponent } from './features/parliamentarians/parliamentarians-list/parliamentarians-list.component';
import { ProjectsListComponent } from './features/projects/projects-list/projects-list.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  {
    path: 'auth',
    canMatch: [guestGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    component: ShellComponent,
    canMatch: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'complaints', component: ComplaintsListComponent },
      { path: 'complaints/new', component: ComplaintSubmitComponent },
      { path: 'parliamentarians', component: ParliamentariansListComponent },
      { path: 'projects', component: ProjectsListComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
        ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
