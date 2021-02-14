import { Component, OnInit, ViewChild } from '@angular/core';

import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-solid-svg-icons';

import { PasswordModalComponent } from 'src/app/components/common/password-modal/password-modal.component';
import { ErrorModalComponent } from 'src/app/components/common/error-modal/error-modal.component';

import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { NavbarService } from 'src/app/shared/services/navbar/navbar.service';
import { UserDataService } from 'src/app/shared/services/user-data/user-data.service';
import { AppointmentsService } from 'src/app/shared/services/appointments/appointments.service';
import { UserData } from '../../shared/models/user-data.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { DeleteUserModalComponent } from 'src/app/components/common/delete-user-modal/delete-user-modal.component';

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

  changeEmail = {
    password: '',
    value: '',
  };

  @ViewChild('name') name;
  @ViewChild('surname') surname;
  @ViewChild('email') email;
  @ViewChild('phone') phone;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private navbarService: NavbarService,
    private appointmentsService: AppointmentsService,
    private modalService: NgbModal,
    private router: Router
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
    if (this.name || this.surname || this.email || this.phone) {
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

      /* Check si el valor es el mismo que el anterior */
      if (value !== this.user[field]) {
        this.loading = { ...this.loading, [field]: true };
        if (field === 'email') {
          this.modalService.open(PasswordModalComponent).result.then(
            (result) => {
              this.updateEmail(result, value);
            },
            () => {
              this.editing = { ...this.editing, [field]: !this.editing[field] };
              this.loading = { ...this.loading, [field]: false };
            }
          );
        } else {
          this.userDataService.updateUserData(this.user.key, field, value, () =>
            this.updateCallback(field, value, false)
          );
        }
      } else {
        this.editing = { ...this.editing, [field]: !this.editing[field] };
      }
    } else {
      this.editing = { ...this.editing, [field]: !this.editing[field] };
    }
  }

  updateEmail(password: string, value: string): void {
    this.authService.updateUser(this.user.email, password, value, (error) =>
      this.updateCallback('email', this.changeEmail.value, error)
    );
  }

  updateCallback(field: string, value: string, error?: any): void {
    this.loading = { ...this.loading, [field]: false };
    this.editing = { ...this.editing, [field]: !this.editing[field] };
    if (!error) {
      this.user = { ...this.user, [field]: value };
      this.getUserData();
      this.navbarService.dispathNavbar();
    } else {
      const errorModal = this.modalService.open(ErrorModalComponent);
      errorModal.componentInstance.error = error.message;
    }
  }

  checkIfEditing(currentField: string): boolean {
    return (
      Object.keys(this.editing).filter(
        (field) => currentField !== field && this.editing[field] === true
      ).length > 0
    );
  }

  eliminarCuenta(): void {
    this.modalService.open(PasswordModalComponent).result.then(
      async (result) => {
        const deleteUserPromise = await this.authService.deleteUser(
          this.user.email,
          result
        );
        const deleteUserDataPromise = await this.userDataService.deleteUserData(
          this.user.uid
        );
        const deleteUserAppointmentsPromise = await this.appointmentsService.deleteUserAppointments(
          this.user.uid
        );
        Promise.all([
          deleteUserPromise,
          deleteUserDataPromise,
          deleteUserAppointmentsPromise,
        ])
          .then(() => {
            this.modalService.open(DeleteUserModalComponent).result.then(
              () => this.logOutOnDelete(),
              () => this.logOutOnDelete()
            );
          })
          .catch((error) => {
            const errorModal = this.modalService.open(ErrorModalComponent);
            errorModal.componentInstance.error = error.message;
          });
      },
      () => {}
    );
  }

  logOutOnDelete(): void {
    this.authService.logout();
    location.reload();
  }
}
