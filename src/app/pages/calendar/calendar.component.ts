import { Component, ViewChild, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { FullCalendarComponent, CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import esLocale from '@fullcalendar/core/locales/es';

import { UserData } from 'src/app/shared/models/user-data.model';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { UserDataService } from 'src/app/shared/services/user-data/user-data.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  user: UserData;

  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    height: 480,
    initialView: 'timeGridWeek',
    weekends: false,
    locale: esLocale,
    dateClick: this.handleDateClick.bind(this), // bind is important!
    defaultAllDay: false,
    allDaySlot: false,
    slotDuration: '00:15:00',
    slotMinTime: '09:00',
    slotMaxTime: '20:30',
    validRange: {
      start: new Date(),
    },
    events: [
      {
        title: 'Cita - Lucia',
        start: '2020-11-19T17:30:00',
        end: '2020-11-19T19:30:00',
      },
      {
        title: 'Ccupada',
        start: '2020-11-20T12:30:00',
        end: '2020-11-20T15:30:00',
        color: '#8B0000',
      },
      {
        title: 'Ocupada',
        start: '2020-11-20T16:30:00',
        end: '2020-11-20T17:30:00',
        color: '#8B0000',
      },
    ],
  };

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService
  ) {}

  async ngOnInit(): Promise<void> {}

  handleDateClick(arg): void {
    alert('date click! ' + arg.dateStr);
  }
}
