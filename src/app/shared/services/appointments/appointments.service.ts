import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AngularFireDatabase } from '@angular/fire/database';
import { Appointment } from '../../models/appointment.model';

import Utils from 'src/app/utils/Utils';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  constructor(private realtimeDb: AngularFireDatabase, private utils: Utils) {}

  getUserAppointments(uid: string): Observable<any> {
    return this.realtimeDb
      .list('/appointments', (ref) => ref.orderByChild('userUid').equalTo(uid))
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            ...(c as any).payload.val(),
            key: c.payload.key,
          }))
        )
      );
  }

  getAppointments(physioUid: string): Observable<any> {
    return this.realtimeDb
      .list('/appointments', (ref) =>
        ref.orderByChild('physioUid').equalTo(physioUid)
      )
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            ...(c as any).payload.val(),
            key: c.payload.key,
          }))
        )
      );
  }

  async getAppointmentsByCriteria(
    physioUid: string,
    userNif: string,
    type: string,
    fromToday: boolean
  ): Promise<any> {
    const today = new Date();
    return new Promise((resolve) => {
      this.realtimeDb
        .list(
          '/appointments',
          (ref) =>
            ref.orderByChild('physioUid').equalTo(physioUid) &&
            (fromToday
              ? ref
                  .orderByChild('date')
                  .equalTo(this.utils.getDateFormatted(today))
              : ref)
        )
        .snapshotChanges()
        .pipe(
          map((changes) =>
            changes
              .filter((c) =>
                userNif
                  ? (c as any).payload.val().userNif === userNif
                  : (c as any).payload.val()
              )
              .filter((c) =>
                type
                  ? (c as any).payload.val().type === type
                  : (c as any).payload.val()
              )
              .map((c) => ({
                ...(c as any).payload.val(),
                key: c.payload.key,
              }))
          )
        )
        .subscribe((res) => {
          resolve(res);
        });
    }).then((res) => res);
  }

  getAppointmentsLength(): Observable<any> {
    return this.realtimeDb
      .object(`/appointments/length`)
      .snapshotChanges()
      .pipe(map((c) => (c as any).payload.val()));
  }

  createAppointment(appointment: Appointment, currentLenght: number): void {
    this.realtimeDb.list<Appointment>('appointments').push(appointment);
    this.realtimeDb
      .object(`/appointments`)
      .update({ length: currentLenght + 1 });
  }

  updateAppointment(key: string, appointment: Appointment): void {
    this.realtimeDb.object(`/appointments/${key}`).update(appointment);
  }

  deleteAppointment(key: string, currentLenght: number): void {
    this.realtimeDb.object(`/appointments/${key}`).remove();
    this.realtimeDb
      .object(`/appointments`)
      .update({ length: currentLenght - 1 });
  }

  deleteUserAppointments(uid: string, currentLenght: number): any {
    let length = currentLenght;
    this.getUserAppointments(uid).subscribe((list) =>
      list.forEach((appointment) => {
        this.deleteAppointment(appointment.key, length);
        length = length - 1;
      })
    );
  }
}
