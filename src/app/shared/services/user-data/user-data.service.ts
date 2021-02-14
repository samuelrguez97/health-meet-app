import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
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

  getUserPhysios(): Observable<any> {
    return this.realtimeDb
      .list('/userData', (ref) => ref.orderByChild('role').equalTo('physio'))
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

  createUserData(userData: UserData): void {
    this.realtimeDb.list<UserData>('userData').push(userData);
  }

  async updateUserData(
    key: string,
    field: string,
    value: string,
    cb: Function
  ): Promise<void> {
    this.realtimeDb.list('/userData').update(key, { [field]: value });
    cb();
  }

  async deleteUserData(uid: string): Promise<any> {
    return await this.getUserData(uid).subscribe((list) =>
      list.forEach((userData) => {
        this.realtimeDb.object(`/userData/${userData.key}`).remove();
      })
    );
  }
}
