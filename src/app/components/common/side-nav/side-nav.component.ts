import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UserData } from 'src/app/shared/models/user-data.model';
import { UserDataService } from '../../../shared/services/user-data/user-data.service';
import { NavbarService } from '../../../shared/services/navbar/navbar.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'],
})
export class SideNavComponent implements OnInit {
  user: UserData = null;
  userPhysio: string;

  show = false;

  public loadingLogOut = false;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private navbarService: NavbarService,
    private router: Router
  ) {
    this.navbarService.navState$.subscribe(() => this.getCurrentUser());
  }

  async ngOnInit(): Promise<void> {
    await this.getCurrentUser();
  }

  async getCurrentUser(): Promise<void> {
    if (!this.user) {
      await this.authService.getCurrentUser().then((response) => {
        this.user = response;
        this.getUserData();
      });
    } else {
      this.getUserData();
    }
  }

  async getUserData(): Promise<void> {
    if (this.user && !this.show) {
      this.show = true;
    }
    let userData: UserData;
    this.userDataService.getUserData(this.user.uid).subscribe((response) => {
      userData = response[0];
      this.user = {
        ...this.user,
        ...userData,
      };
      this.getUserPhysio();
    });
  }

  async getUserPhysio(): Promise<void> {
    if (this.user.role === 'user') {
      this.userDataService
        .getUserData(this.user.physio)
        .subscribe((response) => {
          if (response) {
            this.userPhysio = response[0].name;
          }
        });
    } else {
      this.userPhysio = '-';
    }
  }

  async logOut(): Promise<void> {
    this.loadingLogOut = true;
    await this.authService.logout();
    this.loadingLogOut = false;
    this.user = null;
    this.show = false;
    setTimeout(() => this.router.navigate(['']), 10);
  }

  checkUrl(): void {}
}
