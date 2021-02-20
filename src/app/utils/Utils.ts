import { Injectable } from '@angular/core';

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export default class Utils {
  constructor(private breakpointObserver: BreakpointObserver) {}

  checkIfMobile(): Observable<BreakpointState> {
    return this.breakpointObserver.observe(['(min-width: 990px)']);
  }

  getDateFormatted(date: Date): string {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  getCalendarEndDate(): Date {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 2);
    return endDate;
  }

  checkIfMoreThanAWeek(date: Date): boolean {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return date >= today;
  }
}
