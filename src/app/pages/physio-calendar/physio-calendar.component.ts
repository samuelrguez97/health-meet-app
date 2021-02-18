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
import { BreakpointState } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { AppointmentViewModalComponent } from 'src/app/components/common/appointment-view-modal/appointment-view-modal.component';
import Utils from 'src/app/utils/Utils';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-physio-calendar',
  templateUrl: './physio-calendar.component.html',
  styleUrls: ['./physio-calendar.component.css'],
})
export class PhysioCalendarComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private appointmentService: AppointmentsService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private utils: Utils
  ) {
    this.crearFormularios();
    this.loadPhysios();
  }

  loadingPhysios: boolean = false;
  physios: UserData[];
  currentPhysioUid: string;
  currentPhysio: UserData;

  appointmentForm: FormGroup;
  currentAppointment: Appointment;
  userAppointments: Appointment[];
  loading: boolean;
  sentAppointment: boolean;
  isMobile: boolean;
  toastError = { show: false, msg: '' };

  faCheckCircle = faCheckCircle;

  /* Busqueda usuarios */
  nonExistentUser: boolean = false;
  nonExistentUserForm: FormGroup;
  userList: UserData[] = [];
  userSearched: UserData;
  userHasAppointment: boolean;

  private events = [];
  collectionSize = 0;
  /* */

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
    events: [...this.events],
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

  async loadPhysios(): Promise<void> {
    this.loadingPhysios = true;
    this.physios = await this.userDataService.getAllPhysios();
    this.loadingPhysios = false;
  }

  async getCurrentUser(): Promise<void> {
    this.loading = true;
    if (!this.currentPhysio) {
      setTimeout(
        async () =>
          await this.authService.getCurrentUser().then((response) => {
            this.currentPhysio = response;
            this.currentPhysioUid = response.uid;
            this.userDataService
              .getUserData(response.uid)
              .subscribe((response) => this.setCurrentUserData(response));
            this.loading = false;
          }),
        150
      );
    }
  }

  setCurrentUserData(response): void {
    const userData = response[0];
    this.currentPhysio = response[0];
    this.currentPhysio = {
      ...this.currentPhysio,
      ...userData,
    };
    this.appointmentService
      .getAppointments(this.currentPhysio.uid)
      .subscribe((response) => this.setAppointments(response));
    this.userDataService
      .getUserAppointmentsLength(this.currentPhysio.uid)
      .subscribe((response) => this.setAppointmentsLength(response));
  }

  setAppointmentsLength(response: any): void {
    this.collectionSize = response;
  }

  setAppointments(response: Appointment[]): void {
    const calendarApi = this.calendarComponent.getApi();
    this.resetCalendar();
    if (response) {
      this.userAppointments = response;
      response.forEach((event) => {
        let newEvent: any = {
          start: event.beginDate,
          end: event.endDate,
          title: `${event.userNif} - ${event.userName}`,
          extendedProps: {
            name: event.userName,
            nif: event.userNif,
            eventId: event.eventId,
            key: event.key,
          },
        };
        let existantEvent = false;
        this.events.forEach((userEvent) => {
          if (userEvent.extendedProps.eventId === event.eventId) {
            existantEvent = true;
          }
        });
        if (!existantEvent) {
          newEvent = {
            ...newEvent,
            extendedProps: {
              ...newEvent.extendedProps,
              userId: this.currentPhysio.uid,
            },
          };
          this.events.push(newEvent);
          calendarApi.addEvent(newEvent);
        }
      });
    }
  }

  resetCalendar(): void {
    const calendarApi = this.calendarComponent.getApi();
    this.userAppointments = [];
    calendarApi.removeAllEvents();
    this.events = [];
  }

  crearFormularios(): void {
    this.appointmentForm = this.formBuilder.group({
      type: ['', [Validators.required]],
      therapy: ['', [Validators.required]],
      pain: ['', [Validators.required]],
    });

    this.nonExistentUserForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9À-ÿ\u00f1\u00d1]{3,16}$'),
        ],
      ],
      nif: ['', [Validators.required, Validators.pattern('[0-9]{8}[A-Z]{1}$')]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('[0-9]{9}$'),
          Validators.minLength(9),
        ],
      ],
    });
  }

  handlePhysioChange(event): void {
    this.userDataService
      .getUserData(event.target.value)
      .subscribe((response) => this.setCurrentUserData(response));
  }

  handleNonExistentUserSwitch(): void {
    if (!this.nonExistentUser) {
      this.userSearched = null;
    } else {
      this.nonExistentUserForm.reset();
    }
    this.nonExistentUser = !this.nonExistentUser;
  }

  handleDateClick(date: any): void {
    const dateStart = new Date(date.startStr);
    const dateEnd = new Date(date.endStr);

    if (!this.checkIfEventOverlaps(dateStart, dateEnd)) {
      if (this.timeGreaterThanCurrent(dateStart)) {
        const time = this.diffHours(dateEnd, dateStart);
        if (time <= 1) {
          const appointment: Appointment = {
            physioUid: this.currentPhysio.uid,
            physioName: this.currentPhysio.name,
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

  closedToast(): void {
    this.toastError = { show: false, msg: '' };
  }

  checkIfEventOverlaps(dateStart: Date, dateEnd: Date): boolean {
    let overlaps = false;
    this.events.forEach((event) => {
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
      selectedEvent.extendedProps.userId === this.currentPhysio.uid
    ) {
      const modalRef = this.modalService.open(AppointmentViewModalComponent, {
        centered: true,
      });
      modalRef.componentInstance.appointment = this.userAppointments.filter(
        (appointment) => appointment.key === selectedEvent.extendedProps.key
      )[0];
      modalRef.componentInstance.user = {
        name: selectedEvent.extendedProps.name,
        nif: selectedEvent.extendedProps.nif,
      };
      modalRef.componentInstance.physioView = true;
      modalRef.result.then(
        () => (this.events = []),
        () => (this.events = [])
      );
    }
  }

  async handleSearchUser(event): Promise<void> {
    const input = event.target.value;
    if (input) {
      const users: UserData[] = await this.userDataService.getUsersByName(
        input
      );
      this.userList = users;
    }
  }

  handleSearchClick(user: UserData): void {
    this.userSearched = user;
    this.userList = [];
  }

  open(content): void {
    this.modalService
      .open(content, { centered: true, ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        () => this.resetNewAppointment(),
        () => this.resetNewAppointment()
      );
  }

  resetNewAppointment(): void {
    this.currentAppointment = null;
    this.sentAppointment = false;
    this.userHasAppointment = false;
    this.userSearched = null;
    this.appointmentForm.reset();
  }

  async handleSubmit(): Promise<void> {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAsTouched();
      return;
    }

    if (this.nonExistentUser && this.nonExistentUserForm.invalid) {
      this.nonExistentUserForm.markAsTouched();
      return;
    }

    const { type, therapy, pain } = this.appointmentForm.value;

    if (!this.nonExistentUser) {
      const userNif = this.userSearched.nif;
      const userName = `${this.userSearched.name} ${this.userSearched.surname}`;
      const userUid = this.userSearched.uid;
      const userPhone = this.userSearched.phone;

      const userHasAppointment = await this.appointmentService.checkIfUserHasAppointment(
        userUid,
        new Date(this.currentAppointment.beginDate),
        new Date(this.currentAppointment.endDate)
      );

      if (userHasAppointment) {
        this.userHasAppointment = true;
        return;
      } else {
        this.userHasAppointment = false;
      }

      this.currentAppointment = {
        ...this.currentAppointment,
        userNif,
        userName,
        userUid,
        userPhone,
        type,
        therapy,
        pain,
      };
    } else {
      const { name, nif, phone } = this.nonExistentUserForm.value;

      this.currentAppointment = {
        ...this.currentAppointment,
        userNif: nif,
        userName: name,
        userPhone: phone,
        type,
        therapy,
        pain,
      };
    }

    this.loading = true;

    this.appointmentService.createAppointment(this.currentAppointment);
    this.userDataService.addUserAppointment(this.currentPhysio.uid);
    this.loading = false;
    this.sentAppointment = true;
    this.appointmentForm.reset();
    this.nonExistentUserForm.reset();
  }
}
