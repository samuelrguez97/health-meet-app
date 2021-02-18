import { Component, ViewChild, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FullCalendarComponent, CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import esLocale from '@fullcalendar/core/locales/es';
import { Appointment } from 'src/app/shared/models/appointment.model';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { UserData } from 'src/app/shared/models/user-data.model';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { UserDataService } from 'src/app/shared/services/user-data/user-data.service';
import { AppointmentsService } from '../../shared/services/appointments/appointments.service';
import { NgTemplateOutlet } from '@angular/common';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { AppointmentViewModalComponent } from 'src/app/components/common/appointment-view-modal/appointment-view-modal.component';
import Utils from 'src/app/utils/Utils';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private appointmentService: AppointmentsService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private utils: Utils,
    private router: Router
  ) {
    this.crearFormulario();
  }
  user: UserData;
  appointmentForm: FormGroup;
  currentAppointment: Appointment;
  userAppointments: Appointment[];
  loading: boolean;
  sentAppointment: boolean;
  isMobile: boolean;
  toastError = { show: false, msg: '' };

  faCheckCircle = faCheckCircle;

  private userEvents = [];
  private otherEvents = [];
  collectionSize: number = 0;

  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  // references the #modal in the template
  @ViewChild('appointmentModal') appointmentModal: NgTemplateOutlet;

  calendarOptions: CalendarOptions = {
    height: 800,
    initialView: 'timeGridWeek',
    weekends: false,
    locale: esLocale,
    select: this.handleDateClick.bind(this), // bind is important!
    eventClick: this.handleEventClick.bind(this),
    selectable: true,
    defaultAllDay: false,
    allDaySlot: false,
    nowIndicator: true,
    slotDuration: '00:15:00',
    slotMinTime: '09:00',
    slotMaxTime: '20:30',
    validRange: {
      start: new Date(),
      end: this.utils.getCalendarEndDate(),
    },
    events: [...this.userEvents, ...this.otherEvents],
  };

  async ngOnInit(): Promise<void> {
    this.utils.checkIfMobile().subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.isMobile = false;
      } else {
        this.isMobile = true;
      }
    });
    await this.getCurrentUser();
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

  async setCurrentUserData(response): Promise<void> {
    const userData = response[0];
    this.user = {
      ...this.user,
      ...userData,
    };
    this.appointmentService
      .getUserAppointments(this.user.uid)
      .subscribe((responseUser) => {
        this.appointmentService
          .getAppointments(this.user.physio)
          .subscribe((responsePhysio) =>
            this.setAppointments(responseUser, responsePhysio)
          );
      });

    this.userDataService
      .getUserAppointmentsLength(this.user.physio)
      .subscribe((response) => this.setAppointmentsLength(response));
  }

  setAppointmentsLength(response: any): void {
    this.collectionSize = response;
  }

  setAppointments(
    responseUser: Appointment[],
    responsePhysio: Appointment[]
  ): void {
    const calendarApi = this.calendarComponent.getApi();
    this.resetCalendar();

    let response = responseUser.concat(responsePhysio);
    response = response.filter((item, index) => {
      return response.indexOf(item) == index;
    });

    if (response) {
      this.userAppointments = response;
      response.forEach((event) => {
        let newEvent: any = {
          start: event.beginDate,
          end: event.endDate,
          extendedProps: {
            eventId: event.eventId,
            eventPhysioUid: event.physioUid,
            key: event.key,
          },
        };
        let existantEvent = false;
        this.userEvents.forEach((userEvent) => {
          if (userEvent.extendedProps.eventId === event.eventId) {
            existantEvent = true;
          }
        });
        this.otherEvents.forEach((userEvent) => {
          if (userEvent.extendedProps.eventId === event.eventId) {
            existantEvent = true;
          }
        });
        if (!existantEvent) {
          if (event.userUid === this.user.uid) {
            newEvent = {
              ...newEvent,
              extendedProps: {
                ...newEvent.extendedProps,
                userId: this.user.uid,
              },
            };
            this.userEvents.push(newEvent);
          } else {
            newEvent = {
              ...newEvent,
              title: 'Ocupado',
              color: '#CC0000',
            };
            this.otherEvents.push(newEvent);
          }
          calendarApi.addEvent(newEvent);
        }
        this.deletePreviousAppointments();
      });
    }
  }

  resetCalendar(): void {
    const calendarApi = this.calendarComponent.getApi();
    this.userAppointments = [];
    calendarApi?.removeAllEvents();
    this.userEvents = [];
    this.otherEvents = [];
  }

  checkIfMobile(): void {
    this.breakpointObserver
      .observe(['(min-width: 500px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isMobile = false;
        } else {
          this.isMobile = true;
        }
      });
  }

  crearFormulario(): void {
    this.appointmentForm = this.formBuilder.group({
      type: ['', [Validators.required]],
      therapy: ['', [Validators.required]],
      pain: ['', [Validators.required]],
    });
  }

  deletePreviousAppointments(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.removeAllEvents();
    this.userEvents.map((event) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(event.end);
      if (endDate < today) {
        this.appointmentService.deleteAppointment(
          event.extendedProps.eventPhysioUid,
          event.extendedProps.key
        );
      } else {
        calendarApi.addEvent(event);
      }
    });
    this.otherEvents.map((event) => {
      calendarApi.addEvent(event);
    });
  }

  async handleDateClick(date: any): Promise<void> {
    if (this.user.role === 'user') {
      const dateStart = new Date(date.startStr);
      const dateEnd = new Date(date.endStr);

      if (!this.checkIfEventOverlaps(dateStart, dateEnd)) {
        if (this.timeGreaterThanCurrent(dateStart)) {
          const time = this.diffHours(dateEnd, dateStart);
          if (time <= 1) {
            const physio = await this.userDataService.getUserDataSnapshot(
              this.user.physio
            );

            const appointment: Appointment = {
              userNif: this.user.nif,
              userName: `${this.user.name} ${this.user.surname}`,
              userPhone: this.user.phone,
              userUid: this.user.uid,
              physioUid: this.user.physio,
              physioName: physio.name,
              date: this.utils.getDateFormatted(dateStart),
              beginDate: date.startStr,
              endDate: date.endStr,
              eventId: '_' + Math.random().toString(36).substr(2, 9),
              type: null,
              therapy: null,
              pain: null,
            };

            this.currentAppointment = appointment;

            // Abrir modal
            this.open(this.appointmentModal);
          } else {
            this.toastError = {
              show: true,
              msg: 'La cita puede durar como máximo 1 hora.',
            };
          }
        } else {
          this.toastError = {
            show: true,
            msg: 'La hora de inicio debe ser superior a la actual.',
          };
        }
      } else {
        this.toastError = {
          show: true,
          msg: 'No puedes seleccionar un rango donde ya haya una cita.',
        };
      }
    }
  }

  closedToast(): void {
    this.toastError = { show: false, msg: '' };
  }

  checkIfEventOverlaps(dateStart: Date, dateEnd: Date): boolean {
    let overlaps = false;
    this.userEvents.forEach((event) => {
      const eventDateStart = new Date(event.start);
      const eventDateEnd = new Date(event.end);
      if (dateStart < eventDateStart && dateEnd >= eventDateEnd) {
        overlaps = true;
      }
    });
    this.otherEvents.forEach((event) => {
      const eventDateStart = new Date(event.start);
      const eventDateEnd = new Date(event.end);
      if (dateStart < eventDateStart && dateEnd >= eventDateEnd) {
        overlaps = true;
      }
    });
    return overlaps;
  }

  timeGreaterThanCurrent(date: Date): boolean {
    const today = new Date();
    if (date.getMonth() > today.getMonth()) {
      return true;
    }
    if (date.getDate() > today.getDate()) {
      return true;
    }
    if (date.getHours() === today.getHours()) {
      if (date.getMinutes() > today.getMinutes()) {
        return true;
      }
    } else {
      if (date.getHours() > today.getHours()) {
        return true;
      }
    }
    return false;
  }

  diffHours(dt2: Date, dt1: Date): number {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60;
    return diff;
  }

  handleEventClick(event: any): void {
    const selectedEvent = event.event;
    if (
      selectedEvent &&
      selectedEvent.extendedProps &&
      selectedEvent.extendedProps.userId === this.user.uid
    ) {
      const modalRef = this.modalService.open(AppointmentViewModalComponent, {
        centered: true,
      });
      modalRef.componentInstance.appointment = this.userAppointments.filter(
        (appointment) => appointment.key === selectedEvent.extendedProps.key
      )[0];
      modalRef.componentInstance.user = this.user;
      modalRef.result.then(
        () => (this.userEvents = []),
        () => (this.userEvents = [])
      );
    }
  }

  open(content): void {
    this.modalService
      .open(content, { centered: true, ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        () => (this.sentAppointment = false),
        () => (this.sentAppointment = false)
      );
  }

  handleSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAsTouched();
      return;
    }

    const { type, therapy, pain } = this.appointmentForm.value;

    this.loading = true;

    this.currentAppointment = {
      ...this.currentAppointment,
      type,
      therapy,
      pain,
    };

    this.appointmentService.createAppointment(this.currentAppointment);
    this.userDataService.addUserAppointment(this.user.physio);
    this.loading = false;
    this.sentAppointment = true;
    this.appointmentForm.reset();
  }
}
