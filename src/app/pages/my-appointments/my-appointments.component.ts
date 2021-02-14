import { Component, OnInit } from '@angular/core';
import { BreakpointState } from '@angular/cdk/layout';

import { AppointmentsService } from 'src/app/shared/services/appointments/appointments.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { UserDataService } from 'src/app/shared/services/user-data/user-data.service';

import { Appointment } from 'src/app/shared/models/appointment.model';
import { User } from 'src/app/shared/models/user.model';
import { UserData } from 'src/app/shared/models/user-data.model';
import { Subscription, Observable } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import Utils from '../../utils/Utils';

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.css'],
})
export class MyAppointmentsComponent implements OnInit {
  user: User;
  myAppointments: Appointment[] = [];

  isMobile: boolean = false;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentsService,
    private userDataService: UserDataService,
    private utils: Utils,
  ) {
    this.utils.checkIfMobile().subscribe((state: BreakpointState) => this.checkIfMobileCallback(state))
  }

  async ngOnInit(): Promise<void> {
    await this.getCurrentUser();
  }

  async getCurrentUser(): Promise<void> {
    if (!this.user) {
      await this.authService.getCurrentUser().then((response) => {
        this.user = response;
        this.getAppointments();
      });
    }
  }

  getAppointments(): void {
    this.appointmentService
      .getAppointments(this.user.uid)
      .subscribe((response) => {
        if (response && response.length > 0) {
          response.map((appointment) => {
            this.getUserData(appointment.userUid).subscribe((userData) => {
              if (userData) {
                appointment = { ...appointment, userNif: userData[0].nif };
                this.myAppointments.push(appointment);
              }
            });
          });
        }
      });
  }

  getUserData(userUid: string): Observable<UserData> {
    return this.userDataService.getUserData(userUid);
  }

  checkIfMobileCallback(state: BreakpointState): void {
    this.isMobile = !state.matches;
  }

  editAppointment(index: number): void {
    const appointment = this.myAppointments[index];
  }
}
