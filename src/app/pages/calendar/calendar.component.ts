import { Component, ViewChild, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { FullCalendarComponent, CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import esLocale from '@fullcalendar/core/locales/es';
import { Appointment } from 'src/app/shared/models/appointment.model';

import { UserData } from 'src/app/shared/models/user-data.model';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { UserDataService } from 'src/app/shared/services/user-data/user-data.service';
import { AppointmentsService } from '../../shared/services/appointments/appointments.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  user: UserData;

  private userEvents = [];
  private otherEvents = [];

  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    height: 480,
    initialView: 'timeGridWeek',
    weekends: false,
    locale: esLocale,
    select: this.handleDateClick.bind(this), // bind is important!
    eventClick: this.handleEventClick.bind(this),
    selectable: true,
    defaultAllDay: false,
    allDaySlot: false,
    slotDuration: '00:15:00',
    slotMinTime: '09:00',
    slotMaxTime: '20:30',
    validRange: {
      start: new Date(),
    },
    events: [...this.userEvents, ...this.otherEvents],
  };

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private appointmentService: AppointmentsService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getCurrentUser();
  }

  getAppointments(): void {
    const calendarApi = this.calendarComponent.getApi();
    this.appointmentService
      .getAppointments(this.user.physio)
      .subscribe((response) => {
        if (response) {
          response.map((event) => {
            let newEvent: any = {
              start: event.beginDate,
              end: event.endDate,
              extendedProps: {
                eventId: event.eventId,
                key: event.key,
              },
            };
            let existantEvent = false;
            this.userEvents.map((userEvent) => {
              if (userEvent.extendedProps.eventId === event.eventId) {
                existantEvent = true;
              }
            });
            this.otherEvents.map((userEvent) => {
              if (userEvent.extendedProps.eventId === event.eventId) {
                existantEvent = true;
              }
            });
            if (!existantEvent) {
              if (event.userUid === this.user.uid) {
                newEvent = {
                  ...newEvent,
                  title: 'Cita',
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
        this.appointmentService.deleteAppointment(event.extendedProps.key);
      } else {
        calendarApi.addEvent(event);
      }
    });
    this.otherEvents.map((event) => {
      calendarApi.addEvent(event);
    });
  }

  async getCurrentUser(): Promise<void> {
    if (!this.user) {
      await this.authService.getCurrentUser().then((response) => {
        this.user = response;
        this.getUserData();
      });
    } else {
      this.getUserData();
    }
  }

  getUserData(): void {
    let userData: UserData;
    this.userDataService.getUserData(this.user.uid).subscribe((response) => {
      userData = response[0];
      this.user = {
        ...this.user,
        ...userData,
      };
      this.getAppointments();
    });
  }

  handleDateClick(date: any): void {
    const appointment: Appointment = {
      userUid: this.user.uid,
      physioUid: this.user.physio,
      beginDate: date.startStr,
      endDate: date.endStr,
      eventId: '_' + Math.random().toString(36).substr(2, 9),
    };
    this.appointmentService.createAppointment(appointment);
  }

  handleEventClick(event: any): void {
    const selectedEvent = event.event;
    if (
      selectedEvent &&
      selectedEvent.extendedProps &&
      selectedEvent.extendedProps.userId === this.user.uid
    ) {
      console.log('tu evento');
    }
  }
}
