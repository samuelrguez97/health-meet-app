import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UserData } from 'src/app/shared/models/user-data.model';
import { UserDataService } from '../../../shared/services/user-data/user-data.service';
import { LoginComponent } from '../../../pages/login/login.component';
import { NavbarService } from '../../../shared/services/navbar/navbar.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'],
})
export class SideNavComponent implements OnInit {
  user: any = null;
  show = false;

  public loadingLogOut = false;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private navbarService: NavbarService,
    private router: Router
  ) {
    this.navbarService.navState$.subscribe(() => this.getUserData());
  }

  async ngOnInit(): Promise<void> {
    this.getUserData();
  }

  async getUserData(): Promise<void> {
    let user = await this.authService.getCurrentUser();
    if (user && !this.show) { this.show = true; }
    let userData: UserData;
    this.userDataService.getUserData(user.uid).subscribe((response) => {
      userData = response[0];
      user = {
        ...user,
        ...userData,
      };
      if (user && userData) {
        this.user = user;
      }
    });
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
