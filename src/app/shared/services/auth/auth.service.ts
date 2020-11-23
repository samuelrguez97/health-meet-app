import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';

import { Subject } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/auth';

import { User } from '../../models/user.model';
import { UserData } from '../../models/user-data.model';
import { UserDataService } from '../user-data/user-data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user: User;

  constructor(
    public afAuth: AngularFireAuth,
    public userDataService: UserDataService
  ) {}

  async login(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      return result;
    } catch (error) {
      console.log(`Error en el login: ${error}`);
    }
  }

  async register(
    email: string,
    password: string,
    userData: UserData
  ): Promise<any> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      userData = {
        ...userData,
        uid: result.user.uid,
      };
      this.userDataService.createUserData(userData);
      return result;
    } catch (error) {
      console.log(`Error en el register: ${error}`);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      console.log(`Error en el logout: ${error}`);
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      return await this.afAuth.authState.pipe(first()).toPromise();
    } catch (error) {
      console.log(`Error en el getCurrentUser: ${error}`);
    }
  }
}
