import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AngularFireDatabase } from '@angular/fire/database';
import { Appointment } from '../../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  constructor(private realtimeDb: AngularFireDatabase) {}

  getAppointments(physioUid: string): Observable<any> {
    return this.realtimeDb
      .list('/appointments', (ref) =>
        ref.orderByChild('physioUid').equalTo(physioUid)
      )
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            key: c.payload.key,
            ...(c as any).payload.val(),
          }))
        )
      );
  }

  createAppointment(appointment: Appointment): void {
    this.realtimeDb.list<Appointment>('appointments').push(appointment);
  }

  updateAppointment(key: string, appointment: Appointment): void {
    this.realtimeDb.list('/appointments').update(key, appointment);
  }

  deleteAppointment(key: string): void {
    this.realtimeDb.list('/appointments').remove(key);
  }
}
