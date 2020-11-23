import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../shared/services/auth/auth.service';
import { Alert } from '../../shared/models/alert.model';
import { UserData } from '../../shared/models/user-data.model';
import { NavbarService } from '../../shared/services/navbar/navbar.service';
import { ServiceError } from '../../shared/models/service-error.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public loading = false;

  public isWhatCollapsed = true;
  public isHowCollapsed = true;
  public isBeginCollapsed = true;

  public activeLogIn = 1;
  public activeSignUpForm = 1;

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
    private authService: AuthService
  ) {
    this.crearFormularios();
  }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.router.navigate(['/home']);
    }
  }

  crearFormularios(): void {
    this.signUpForm = this.formBuilder.group({
      fisioterapeuta: ['', [Validators.required]],
      nif: ['', [Validators.required]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(9)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        ],
      ],
      password: ['', [Validators.required]],
    });
    this.logInForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        ],
      ],
      password: ['', [Validators.required]],
    });
  }

  async handleSubmit(): Promise<void> {
    if (this.activeSignUpForm === 1) {
      this.activeSignUpForm = 2;
      return;
    }
    this.loading = true;
    const {
      fisioterapeuta,
      nif,
      name,
      surname,
      phone,
      email,
      password,
    } = this.signUpForm.value;
    const userData: UserData = {
      fisioterapeuta,
      nif,
      name,
      surname,
      phone,
      uid: '',
    };
    const user = await this.authService.register(email, password, userData);
    if (user) {
      this.redirectAndDispatch();
    } else {
      this.signUpError = { error: true, msg: 'Ya existe una cuenta asociada a este correo' };
    }
    this.loading = false;
  }

  async handleLogIn(): Promise<void> {
    const { email, password } = this.logInForm.value;
    this.loading = true;
    const user = await this.authService.login(email, password);
    if (user) {
      this.redirectAndDispatch();
    } else {
      this.logInError = { error: true, msg: 'Email o contraseña incorrectos' };
    }
    this.loading = false;
  }

  redirectAndDispatch(): void {
    setTimeout(() => {
      this.navbarService.dispathNavbar();
      this.router.navigate(['/home']);
    }, 10);
  }

  closeLoginError(): void {
    this.logInError = { ...this.logInError, error: false };
  }

  closeSignUpError(): void {
    this.signUpError =  { ...this.signUpError, error: false };
  }
}
