import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

import { UserData } from '../../models/user-data.model';

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
      .valueChanges();
  }

  createUserData(userData: UserData): void {
    this.realtimeDb.list<UserData>('userData').push(userData);
  }

  async updateUserData(
    userId: string,
    basicData: boolean,
    value: string,
    cb: any,
  ): Promise<void> {
    if (basicData) {
      (await this.afAuth.currentUser).updateEmail(value).then(() => {
        cb();
      });
    }
    // this.realtimeDb
    //   .list('/userData', (ref) => ref.orderByChild('uid').equalTo(userId))
    //   .update(userData);
  }
}
