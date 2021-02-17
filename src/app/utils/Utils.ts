import { Injectable } from '@angular/core';

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export default class Utils {
  constructor(private breakpointObserver: BreakpointObserver) {}

  checkIfMobile(): Observable<BreakpointState> {
    return this.breakpointObserver.observe(['(min-width: 770px)']);
  }

  getDateFormatted(date: Date): string {
    return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
  }
}
