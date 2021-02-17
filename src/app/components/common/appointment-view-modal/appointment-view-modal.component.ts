import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { Appointment } from 'src/app/shared/models/appointment.model';
import { AppointmentsService } from 'src/app/shared/services/appointments/appointments.service';

@Component({
  selector: 'app-appointment-view-modal',
  templateUrl: './appointment-view-modal.component.html',
  styleUrls: ['./appointment-view-modal.component.css'],
})
export class AppointmentViewModalComponent implements OnInit {
  constructor(
    public activeModal: NgbActiveModal,
    private appointmentService: AppointmentsService
  ) {
    this.appointmentService
      .getAppointmentsLength()
      .subscribe((response) => this.setAppointmentsLength(response));
  }

  @Input() appointment: Appointment;

  loading: boolean = false;
  deletedAppointment: boolean = false;
  collectionSize: number = 0;

  faCheckCircle = faCheckCircle;

  ngOnInit(): void {}

  setAppointmentsLength(response: any): void {
    this.collectionSize = response;
  }

  deleteAppointment() {
    this.deletedAppointment = true;
    this.appointmentService.deleteAppointment(
      this.appointment.key,
      this.collectionSize
    );
  }
}
