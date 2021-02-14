import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { TitleComponent } from './components/common/title/title.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { SideNavComponent } from './components/common/side-nav/side-nav.component';
import { CalendarComponent } from './pages/calendar/calendar.component';

import { environment } from '../environments/environment';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ProfileComponent } from './pages/profile/profile.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MyAppointmentsComponent } from './pages/my-appointments/my-appointments.component';
import { FaqComponent } from './pages/faq/faq.component';
import { FaqCardComponent } from './components/common/faq-card/faq-card.component';
import { PasswordModalComponent } from './components/common/password-modal/password-modal.component';
import { ErrorModalComponent } from './components/common/error-modal/error-modal.component';
import { DeleteUserModalComponent } from './components/common/delete-user-modal/delete-user-modal.component';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin,
]);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TitleComponent,
    FooterComponent,
    SideNavComponent,
    CalendarComponent,
    ProfileComponent,
    MyAppointmentsComponent,
    FaqComponent,
    FaqCardComponent,
    PasswordModalComponent,
    ErrorModalComponent,
    DeleteUserModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    ReactiveFormsModule,
    MatToolbarModule,
    NgbModule,
    FullCalendarModule,
    FontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
