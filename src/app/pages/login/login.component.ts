import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../shared/services/auth/auth.service';
import { UserData } from '../../shared/models/user-data.model';
import { NavbarService } from '../../shared/services/navbar/navbar.service';
import { ServiceError } from '../../shared/models/service-error.model';
import { UserDataService } from '../../shared/services/user-data/user-data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public loading = false;
  public loadingPhysios = false;

  public activeLogIn = 1;
  public activeSignUpForm = 1;

  public physios = [];

  logInError: ServiceError = {
    error: false,
    msg: '',
  };

  signUpError: ServiceError = {
    error: false,
    msg: '',
  };

  signUpForm: FormGroup;
  logInForm: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private navbarService: NavbarService,
    private authService: AuthService,
    private userDataService: UserDataService
  ) {
    this.crearFormularios();
  }

  ngOnInit(): void {
    this.loadPhysios();
  }

  loadPhysios(): void {
    this.loadingPhysios = true;
    this.userDataService.getUserPhysios().subscribe((response) => {
      this.physios = response;
      this.loadingPhysios = false;
    });
  }

  crearFormularios(): void {
    this.signUpForm = this.formBuilder.group({
      physio: ['', [Validators.required]],
      nif: ['', [Validators.required, Validators.pattern('[0-9]{8}[A-Z]{1}$')]],
      name: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9À-ÿ\u00f1\u00d1]{3,16}$'),
        ],
      ],
      surname: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9À-ÿ\u00f1\u00d1]{3,30}$'),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('[0-9]{9}$'),
          Validators.minLength(9),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        ],
      ],
      password: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z0-9_-]{6,18}$')],
      ],
    });
    this.logInForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        ],
      ],
      password: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z0-9_-]{6,18}$')],
      ],
    });
  }

  async handleSubmit(): Promise<void> {
    if (this.activeSignUpForm === 1) {
      const { nif, name, surname, phone } = this.signUpForm.controls;
      if (nif.valid && name.valid && surname.valid && phone.valid) {
        this.activeSignUpForm = 2;
      } else {
        nif.markAsTouched();
        name.markAsTouched();
        surname.markAsTouched();
        phone.markAsTouched();
      }
      return;
    } else {
      const { email, password } = this.signUpForm.controls;
      if (email.valid && password.valid) {
        this.loading = true;
        const {
          physio,
          nif,
          name,
          surname,
          phone,
          email,
          password,
        } = this.signUpForm.value;
        const userData: UserData = {
          physio,
          nif,
          name,
          surname,
          phone,
          role: 'user',
        };
        const user = await this.authService.register(email, password, userData);
        if (user) {
          this.redirectAndDispatch(userData);
        } else {
          this.signUpError = {
            error: true,
            msg: 'Ya existe una cuenta asociada a este correo',
          };
        }
        this.loading = false;
      } else {
        email.markAsTouched();
        password.markAsTouched();
      }
    }
  }

  async handleLogIn(): Promise<void> {
    const { email, password } = this.logInForm.value;

    if (!this.logInForm.valid) {
      this.logInForm.markAsTouched();
      return;
    }

    this.loading = true;
    const login = await this.authService.login(email, password);
    if (login) {
      this.userDataService.getUserData(login.user.uid).subscribe((response) => {
        const userData = response[0];
        this.redirectAndDispatch(userData);
      });
    } else {
      this.logInError = {
        error: true,
        msg: 'Email o contraseña incorrectos',
      };
      this.loading = false;
    }
  }

  redirectAndDispatch(user: UserData): void {
    setTimeout(() => {
      this.loading = false;
      this.navbarService.dispathNavbar();
      this.router.navigate([
        `${user.role === 'user' ? '/home' : '/appointments'}`,
      ]);
    }, 50);
  }

  closeLoginError(): void {
    this.logInError = { ...this.logInError, error: false };
  }

  closeSignUpError(): void {
    this.signUpError = { ...this.signUpError, error: false };
  }
}
