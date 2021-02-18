import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserData } from '../../models/user-data.model';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(
    private realtimeDb: AngularFireDatabase,
    public afAuth: AngularFireAuth
  ) {}

  async getUserDataAsync(userId: string): Promise<any> {
    return new Promise((resolve) => {
      this.realtimeDb
        .list(`/userData`, (ref) =>
          ref.orderByChild('uid').equalTo(userId).limitToFirst(1)
        )
        .snapshotChanges()
        .pipe(
          map((changes) =>
            changes.map((c) => ({
              key: c.payload.key,
              ...(c as any).payload.val(),
            }))
          )
        )
        .subscribe((res) => {
          resolve(res);
        });
    }).then((res) => res);
  }

  getUserData(userId: string): Observable<any> {
    return this.realtimeDb
      .list('/userData', (ref) => ref.orderByChild('uid').equalTo(userId))
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

  getAllPhysios(): Promise<any> {
    return new Promise((resolve) =>
      this.realtimeDb
        .list('/userData', (ref) => ref.orderByChild('role').equalTo('physio'))
        .snapshotChanges()
        .pipe(
          map((changes) =>
            changes.map((c) => ({
              key: c.payload.key,
              ...(c as any).payload.val(),
            }))
          )
        )
        .subscribe((response) => resolve(response))
    ).then((res) => res);
  }

  getUsersByName(userName: string): Promise<any> {
    return new Promise((resolve) =>
      this.realtimeDb
        .list('/userData', (ref) => ref.orderByChild('role').equalTo('user'))
        .snapshotChanges()
        .pipe(
          map((changes) =>
            changes
              .filter((c) =>
                (c as any).payload
                  .val()
                  .name.toLowerCase()
                  .includes(userName.toLowerCase())
              )
              .map((c) => ({
                key: c.payload.key,
                ...(c as any).payload.val(),
              }))
          )
        )
        .subscribe((response) => resolve(response))
    ).then((res) => res);
  }

  createUserData(userData: UserData): void {
    this.realtimeDb.list<UserData>('userData').push(userData);
  }

  async updateUserData(
    key: string,
    field: string,
    value: any,
    cb: Function
  ): Promise<void> {
    this.realtimeDb
      .object(`/userData/${key}`)
      .update({ [field]: value })
      .finally(() => cb());
  }

  async deleteUserData(uid: string): Promise<any> {
    return await this.getUserData(uid).subscribe((list) =>
      list.forEach((userData) => {
        this.realtimeDb.object(`/userData/${userData.key}`).remove();
      })
    );
  }

  getUserAppointmentsLength(uid: string): Observable<any> {
    return this.realtimeDb
      .list(`/userData`, (ref) =>
        ref.orderByChild('uid').equalTo(uid).limitToFirst(1)
      )
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) =>
            parseInt((c as any).payload.val().appointmentsLength)
          )
        )
      );
  }

  async addUserAppointment(uid: string): Promise<void> {
    const userPromise = await this.getUserDataAsync(uid);
    const length = parseInt(userPromise[0].appointmentsLength) + 1;
    this.updateUserData(
      userPromise[0].key,
      'appointmentsLength',
      length,
      () => {}
    );
  }

  async deleteUserAppointment(uid: string): Promise<void> {
    const userPromise = await this.getUserDataAsync(uid);
    const length = parseInt(userPromise[0].appointmentsLength) - 1;
    this.updateUserData(
      userPromise[0].key,
      'appointmentsLength',
      length,
      () => {}
    );
  }
}
