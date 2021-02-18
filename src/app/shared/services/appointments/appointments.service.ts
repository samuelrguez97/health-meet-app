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
            ...(c as any).payload.val(),
            key: c.payload.key,
          }))
        )
      );
  }

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

  async getAppointmentsByCriteria(
    physioUid: string,
    userName: string,
    type: string,
    date: string
  ): Promise<any> {
    return new Promise((resolve) => {
      this.realtimeDb
        .list('/appointments', (ref) =>
          ref.orderByChild('physioUid').equalTo(physioUid)
        )
        .snapshotChanges()
        .pipe(
          map((changes) =>
            changes
              .filter((c) =>
                date
                  ? (c as any).payload.val().date === date
                  : (c as any).payload.val()
              )
              .filter((c) =>
                userName
                  ? (c as any).payload
                      .val()
                      .userName?.toLowerCase()
                      .includes(userName.toLowerCase())
                  : (c as any).payload.val()
              )
              .filter((c) =>
                type
                  ? type === 'todos'
                    ? (c as any).payload.val()
                    : (c as any).payload.val().type === type
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

  createAppointment(appointment: Appointment): string {
    return this.realtimeDb.list<Appointment>('appointments').push(appointment)
      .key;
  }

  updateAppointment(key: string, appointment: Appointment): void {
    this.realtimeDb.object(`/appointments/${key}`).update(appointment);
  }

  deleteAppointment(key: string): void {
    this.realtimeDb.object(`/appointments/${key}`).remove();
  }

  deleteUserAppointments(uid: string): any {
    this.getUserAppointments(uid).subscribe((list) =>
      list.forEach((appointment) => {
        this.deleteAppointment(appointment.key);
      })
    );
  }

  async checkIfUserHasAppointment(
    uid: string,
    beginDate: Date,
    endDate: Date,
    eventId?: string
  ): Promise<boolean> {
    return await new Promise((resolve) => {
      this.realtimeDb
        .list('/appointments', (ref) =>
          ref.orderByChild('userUid').equalTo(uid)
        )
        .snapshotChanges()
        .pipe(
          map((changes) =>
            changes
              .filter((c) => {
                const event = (c as any).payload.val();
                const eventBeginDate = new Date(event.beginDate);
                const eventEndDate = new Date(event.endDate);
                if (eventId === event.eventId) {
                  return false;
                } else if (
                  (beginDate > eventBeginDate && beginDate < eventEndDate) ||
                  (endDate > eventBeginDate && endDate <= eventEndDate) ||
                  (eventBeginDate > beginDate && eventBeginDate < endDate) ||
                  (eventEndDate > beginDate && eventEndDate <= endDate)
                ) {
                  return true;
                } else {
                  return false;
                }
              })
              .map((c) => ({
                ...(c as any).payload.val(),
                key: c.payload.key,
              }))
          )
        )
        .subscribe((res) => {
          resolve(res);
        });
    }).then((res: Appointment[]) => res.length > 0);
  }
}
