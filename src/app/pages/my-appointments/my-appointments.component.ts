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

  loading: boolean = true;
  faCheckCircle = faCheckCircle;

  user: UserData;
  myAppointments: Appointment[] = [];
  myAppointmentsComplete: Appointment[] = [];
  currentAppointment: Appointment;
  sentAppointment: boolean = false;

  error: any = { flag: false, msg: '' };

  /* Pagination */
  page = 1;
  pageSize = 5;
  collectionSize = 0;
  currentPage = this.page;
  /* */

  /* Búsqueda */
  filterOn: boolean = false;
  types: string[] = ['todos', 'seguro', 'privado'];

  busquedaNombre: string = '';
  busquedaTipo: string = this.types[0];
  busquedaDia: any;
  /* */

  /* Selector editar fecha  */
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
  /* */

  isMobile: boolean = false;

  @ViewChild('appointmentModal') appointmentModal: NgTemplateOutlet;
  @ViewChild('deleteAppointmentModal') deleteAppointmentModal: NgTemplateOutlet;

  async ngOnInit(): Promise<void> {
    await this.getCurrentUser();
  }

  getAppointments() {
    this.appointmentService
      .getAppointments(this.user.uid)
      .subscribe((response: Appointment[]) => this.setAppointments(response));
  }

  getUserAppointmentsLength() {
    this.userDataService
      .getUserAppointmentsLength(this.user.uid)
      .subscribe((response) => this.setAppointmentsLength(response));
  }

  async getCurrentUser(): Promise<void> {
    if (!this.user) {
      await this.authService.getCurrentUser().then((response) => {
        this.user = response;
        this.userDataService
          .getUserData(response.uid)
          .subscribe((response) => this.setCurrentUserData(response));
      });
    }
  }

  setCurrentUserData(response): void {
    const userData = response[0];
    this.user = {
      ...this.user,
      ...userData,
    };
    this.getAppointments();
    this.getUserAppointmentsLength();
  }

  setAppointmentsLength(response: any): void {
    this.collectionSize = response;
  }

  setAppointments(response: Appointment[]): void {
    this.clearMyAppointments();
    if (response && response.length > 0) {
      response
        .sort((a: any, b: any) => a.beginDate.localeCompare(b.beginDate))
        .forEach((appointment) => {
          this.myAppointmentsComplete.push(appointment);
        });
    }
    this.refreshAppointments();
    this.loading = false;
  }

  getUserData(userUid: string): Observable<UserData> {
    return this.userDataService.getUserData(userUid);
  }

  checkIfMobileCallback(state: BreakpointState): void {
    this.isMobile = !state.matches;
  }

  clearMyAppointments(): void {
    this.myAppointmentsComplete = [];
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

    this.openEditAppointment(this.appointmentModal);
  }

  deleteAppointment(index: number): void {
    this.currentAppointment = this.myAppointments[index];
    this.openDeleteAppointment(this.deleteAppointmentModal);
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
      date.getDate() === dateToCompare.getDate() &&
      date.getHours() === dateToCompare.getHours() &&
      date.getMinutes() === dateToCompare.getMinutes()
    );
  };

  checkIfLessTime = (date: Date, dateToCompare: Date): boolean => {
    return (
      date.getHours() >= dateToCompare.getHours() &&
      date.getMinutes() >= dateToCompare.getMinutes()
    );
  };

  checkIfMoreThanAnHour = (date: Date, dateToCompare: Date): boolean => {
    const ONE_HOUR = 60 * 60 * 1000;
    return dateToCompare.getTime() - date.getTime() > ONE_HOUR;
  };

  checkIfOnTime = (beginDate: Date, endDate: Date): boolean => {
    const appointmentStart = this.getNonMilisecDate(beginDate);
    const appointmentEnd = this.getNonMilisecDate(endDate);

    const hourStart = new Date(
      beginDate.getFullYear(),
      beginDate.getMonth() + 1,
      beginDate.getDate()
    );
    hourStart.setHours(9, 0, 0);
    const hourEnd = new Date(
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      endDate.getDate()
    );
    hourEnd.setHours(20, 0, 0);

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

  openEditAppointment(content): void {
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

  openDeleteAppointment(content): void {
    this.modalService
      .open(content, { centered: true, ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        () => {},
        async (del) => {
          if (del) {
            await this.appointmentService.deleteAppointment(
              this.currentAppointment.physioUid,
              this.currentAppointment.key
            );
          }
        }
      );
  }

  getFormattedDate(date: NgbDateStruct, time: any): Date {
    return new Date(
      date.year,
      date.month - 1,
      date.day,
      time.hour,
      time.minute
    );
  }

  closeAlert(): void {
    this.error = { flag: false, msg: '' };
  }

  async handleEdit(): Promise<void> {
    this.loading = true;
    const beginDate = this.getFormattedDate(this.date, this.beginTime);
    const endDate = this.getFormattedDate(this.date, this.endTime);

    let userHasAppointment = false;

    if (this.currentAppointment.userUid) {
      userHasAppointment = await this.appointmentService.checkIfUserHasAppointment(
        this.currentAppointment.userUid,
        beginDate,
        endDate,
        this.currentAppointment.eventId
      );
    }

    if (this.currentAppointment.type === 'seguro') {
      if (this.utils.checkIfMoreThanAWeek(new Date(beginDate))) {
        this.error = {
          flag: true,
          msg:
            'No se puede citar con más de una semana de antelación en caso de venir de un seguro.',
        };
        this.loading = false;
        return;
      }
    }

    if (!this.checkIfEventOverlaps(beginDate, endDate) && !userHasAppointment) {
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
        if (!this.checkIfLessTime(beginDate, endDate)) {
          if (this.checkIfOnTime(beginDate, endDate)) {
            if (!this.checkIfMoreThanAnHour(beginDate, endDate)) {
              this.sentAppointment = true;
              this.currentAppointment = {
                ...this.currentAppointment,
                beginDate: beginDate.toISOString(),
                endDate: endDate.toISOString(),
              };
              delete this.currentAppointment['id'];
              this.appointmentService.updateAppointment(
                this.currentAppointment.key,
                this.currentAppointment
              );
            } else {
              this.error = {
                flag: true,
                msg: 'La cita puede durar como máximo una hora',
              };
            }
          } else {
            this.error = {
              flag: true,
              msg: 'Has seleccionado horas fuera de horario laboral',
            };
          }
        } else {
          this.error = {
            flag: true,
            msg: 'Has seleccionado un periodo inválido',
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

  async getAppointmentsByCriteria(
    userName: string,
    type: string,
    dia: string
  ): Promise<void> {
    const response = await this.appointmentService.getAppointmentsByCriteria(
      this.user.uid,
      userName,
      type,
      dia
    );
    this.page = 1;
    this.setAppointments(response);
    this.setAppointmentsLength(response.length);
  }

  getAppointmentsFilter(): void {
    this.filterOn = true;
    const busquedaDiaAux = this.busquedaDia
      ? `${this.busquedaDia.day}-${this.busquedaDia.month}-${this.busquedaDia.year}`
      : '';
    this.getAppointmentsByCriteria(
      this.busquedaNombre,
      this.busquedaTipo,
      busquedaDiaAux
    );
  }

  resetAppointments(): void {
    this.filterOn = false;
    this.busquedaDia = '';
    this.busquedaNombre = '';
    this.busquedaTipo = this.types[0];
    this.getAppointments();
    this.getUserAppointmentsLength();
  }

  refreshAppointments(): void {
    this.myAppointments = this.myAppointmentsComplete
      .map((appointment, i) => {
        return { id: i + 1, ...appointment };
      })
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      );
  }
}
