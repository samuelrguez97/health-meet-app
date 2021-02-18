import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { PhysioManagementComponent } from './pages/physio-management/physio-management.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FaqComponent } from './pages/faq/faq.component';

import { AuthGuard } from './guard/auth-guard/auth-guard.guard';
import { LoggedGuardGuard } from './guard/logged-guard/logged-guard.guard';
import { AdminGuard } from './guard/admin-guard/admin.guard';
import { UserGuardGuard } from './guard/user-guard/user-guard.guard';

const routes: Routes = [
  { path: '', component: LoginComponent, canActivate: [LoggedGuardGuard] },
  {
    path: 'home',
    pathMatch: 'full',
    component: CalendarComponent,
    canActivate: [AuthGuard, UserGuardGuard],
  },
  {
    path: 'profile',
    pathMatch: 'full',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'management',
    pathMatch: 'full',
    component: PhysioManagementComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'user-management',
    pathMatch: 'full',
    component: UserManagementComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'faqs',
    pathMatch: 'full',
    component: FaqComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
