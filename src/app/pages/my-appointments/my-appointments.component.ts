import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointState } from '@angular/cdk/layout';

import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { AppointmentsService } from 'src/app/shared/services/appointments/appointments.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { UserDataService } from 'src/app/shared/services/user-data/user-data.service';

import { Appointment } from 'src/app/shared/models/appointment.model';
import { User } from 'src/app/shared/models/user.model';
import { UserData } from 'src/app/shared/models/user-data.model';
import { Subscription, Observable } from 'rxjs';

/* Datepicker I18N */
import { I18n, CustomDatepickerI18n } from './../../utils/DatepickerI18N';

import Utils from '../../utils/Utils';
import { NgTemplateOutlet } from '@angular/common';
import {
  NgbCalendar,
  NgbDate,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.css'],
  providers: [
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
  ],
})
export class MyAppointmentsComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentsService,
    private userDataService: UserDataService,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    private utils: Utils
  ) {
    this.utils
      .checkIfMobile()
      .subscribe((state: BreakpointState) => this.checkIfMobileCallback(state));
  }

  loading: boolean = false;
  faCheckCircle = faCheckCircle;

  user: User;
  myAppointments: Appointment[] = [];
  currentAppointment: Appointment;
  sentAppointment: boolean = false;

  error: any = { flag: false, msg: '' };

  date: NgbDateStruct;
  beginTime: any;
  endTime: any;

  minDate: Date = new Date();
  maxDate: Date = new Date(new Date().setMonth(this.minDate.getMonth() + 4));
  minDateNgb: NgbDateStruct = {
    year: this.minDate.getFullYear(),
    month: this.minDate.getMonth() + 1,
    day: this.minDate.getDate(),
  };
  maxDateNgb: NgbDateStruct = {
    year: this.maxDate.getFullYear(),
    month: this.maxDate.getMonth() + 1,
    day: this.maxDate.getDate(),
  };
  isDisabled = (date: NgbDate) => this.calendar.getWeekday(date) >= 6;

  isMobile: boolean = false;

  @ViewChild('appointmentModal') appointmentModal: NgTemplateOutlet;

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
          this.clearMyAppointments();
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

  clearMyAppointments(): void {
    this.myAppointments = [];
  }

  editAppointment(index: number): void {
    this.currentAppointment = this.myAppointments[index];

    const beginDate = new Date(this.currentAppointment.beginDate);
    const endDate = new Date(this.currentAppointment.endDate);

    this.date = {
      year: beginDate.getFullYear(),
      month: beginDate.getMonth() + 1,
      day: beginDate.getDate(),
    };
    this.beginTime = {
      hour: beginDate.getHours(),
      minute: beginDate.getMinutes(),
    };
    this.endTime = {
      hour: endDate.getHours(),
      minute: endDate.getMinutes(),
    };

    this.open(this.appointmentModal);
  }

  checkIfEventOverlaps(dateStart: Date, dateEnd: Date): boolean {
    let overlaps = false;
    this.myAppointments.forEach((event) => {
      if (this.currentAppointment.key !== event.key) {
        const eventDateStart = new Date(event.beginDate);
        const eventDateEnd = new Date(event.endDate);
        if (
          (dateStart > eventDateStart && dateStart < eventDateEnd) ||
          (dateEnd > eventDateStart && dateEnd < eventDateEnd)
        ) {
          overlaps = true;
        }
      }
    });
    return overlaps;
  }

  checkIfSameTimes = (date: Date, dateToCompare: Date): boolean => {
    return (
      date.getHours() === dateToCompare.getHours() &&
      date.getMinutes() === dateToCompare.getMinutes()
    );
  };

  checkIfOnTime = (beginDate: Date, endDate: Date): boolean => {
    const appointmentStart = this.getNonMilisecDate(beginDate);
    const appointmentEnd = this.getNonMilisecDate(endDate);

    const hourStart = new Date(
      beginDate.getFullYear(),
      beginDate.getMonth() + 1,
      beginDate.getDate(),
      9,
      0,
      0,
      0
    );
    const hourEnd = new Date(
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      endDate.getDate(),
      20,
      0,
      0,
      0
    );

    return (
      appointmentStart.getTime() >= hourStart.getTime() &&
      appointmentEnd.getTime() <= hourEnd.getTime()
    );
  };

  getNonMilisecDate = (date: Date) =>
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMilliseconds(),
      0,
      0
    );

  open(content): void {
    this.modalService
      .open(content, { centered: true, ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        () => {
          this.sentAppointment = false;
          this.closeAlert();
        },
        () => {
          this.sentAppointment = false;
          this.closeAlert();
        }
      );
  }

  getFormattedDate(date: NgbDateStruct, time: any): Date {
    return new Date(
      `${date.year}-${date.month}-${date.day} ${time.hour}:${time.minute}`
    );
  }

  closeAlert(): void {
    this.error = { flag: false, msg: '' };
  }

  handleEdit(): void {
    this.loading = true;
    const beginDate = this.getFormattedDate(this.date, this.beginTime);
    const endDate = this.getFormattedDate(this.date, this.endTime);
    if (!this.checkIfEventOverlaps(beginDate, endDate)) {
      if (
        !this.checkIfSameTimes(
          new Date(this.currentAppointment.beginDate),
          beginDate
        ) ||
        !this.checkIfSameTimes(
          new Date(this.currentAppointment.endDate),
          endDate
        )
      ) {
        if (this.checkIfOnTime(beginDate, endDate)) {
          this.sentAppointment = true;
          this.currentAppointment = {
            ...this.currentAppointment,
            beginDate: beginDate.toISOString(),
            endDate: endDate.toISOString(),
          };
          this.appointmentService.updateAppointment(
            this.currentAppointment.key,
            this.currentAppointment
          );
        } else {
          this.error = {
            flag: true,
            msg: 'Has seleccionado horas fuera de horario laboral',
          };
        }
      } else {
        this.error = {
          flag: true,
          msg: 'Has seleccionado el periodo inicial',
        };
      }
    } else {
      this.error = {
        flag: true,
        msg: 'No se pueden seleccionar horas ya citadas',
      };
    }
    this.loading = false;
  }
}
