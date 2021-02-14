import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyAppointmentsComponent } from './pages/my-appointments/my-appointments.component';
import { FaqComponent } from './pages/faq/faq.component';

import { AuthGuard } from './guard/auth-guard/auth-guard.guard';
import { LoggedGuardGuard } from './guard/logged-guard/logged-guard.guard';

const routes: Routes = [
  { path: '', component: LoginComponent, canActivate: [LoggedGuardGuard] },
  { path: 'home', component: CalendarComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'appointments',
    component: MyAppointmentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'faqs',
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
