import { Component, OnInit, ViewChild } from '@angular/core';

import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { NavbarService } from 'src/app/shared/services/navbar/navbar.service';
import { UserDataService } from 'src/app/shared/services/user-data/user-data.service';
import { UserData } from '../../shared/models/user-data.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: UserData;
  faEdit = faEdit;
  faSave = faSave;

  loading = {
    name: false,
    surname: false,
    email: false,
    phone: false,
  };

  editing = {
    name: false,
    surname: false,
    email: false,
    phone: false,
  };

  errors = {
    name: false,
    surname: false,
    email: false,
    phone: false,
  };

  @ViewChild('name') name;
  @ViewChild('surname') surname;
  @ViewChild('email') email;
  @ViewChild('phone') phone;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private navbarService: NavbarService
  ) {}

  async ngOnInit(): Promise<void> {
    this.getUserData();
  }

  async getUserData(): Promise<void> {
    let user = await this.authService.getCurrentUser();
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

  edit(field: string): void {
    this.editing = { ...this.editing, [field]: !this.editing[field] };
    if (this.name || this.surname || this.email || this.phone) {
      this.loading = { ...this.loading, [field]: true };
      let value;
      switch (field) {
        case 'name':
          value = this.name.nativeElement.value;
          break;
        case 'surname':
          value = this.surname.nativeElement.value;
          break;
        case 'email':
          value = this.email.nativeElement.value;
          break;
        case 'phone':
          value = this.phone.nativeElement.value;
          break;
        default:
          value = '';
      }
      this.user = { ...this.user, [field]: value };
      if (field === 'email') {
        this.userDataService.updateUserData(this.user.uid, true, value, () => {
          this.loading = { ...this.loading, [field]: false };
          this.getUserData();
          this.navbarService.dispathNavbar();
        });
      }
    }
  }
}
