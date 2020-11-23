import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  private navStateSource = new Subject<any>();
  navState$ = this.navStateSource.asObservable();

  constructor() {}

  dispathNavbar(): void {
    this.navStateSource.next(true);
  }
}
