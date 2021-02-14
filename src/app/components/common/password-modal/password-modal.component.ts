import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-password-modal',
  templateUrl: './password-modal.component.html',
  styleUrls: ['./password-modal.component.css'],
})
export class PasswordModalComponent implements OnInit {
  passwordForm: FormGroup;
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.crearFormulario();
  }

  crearFormulario(): void {
    this.passwordForm = this.formBuilder.group({
      password: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z0-9_-]{6,18}$')],
      ],
    });
  }

  handleSubmit(): void {
    this.loading = true;
    try {
      if (this.passwordForm.controls.password.valid) {
        this.activeModal.close(this.passwordForm.controls.password.value);
      }
    } finally {
      this.loading = false;
    }
  }

  ngOnInit(): void {}
}
