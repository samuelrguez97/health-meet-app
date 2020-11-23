import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuardService as AuthGuard } from './guard/auth-guard/auth-guard.service';

import { LoginComponent } from './pages/login/login.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePhysioComponent } from './pages/change-physio/change-physio.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: CalendarComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'change-physio', component: ChangePhysioComponent, canActivate: [AuthGuard] },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
