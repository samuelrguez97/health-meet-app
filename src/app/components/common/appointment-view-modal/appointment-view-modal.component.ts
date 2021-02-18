import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { Appointment } from 'src/app/shared/models/appointment.model';
import { AppointmentsService } from 'src/app/shared/services/appointments/appointments.service';
import { UserDataService } from 'src/app/shared/services/user-data/user-data.service';
import { UserData } from 'src/app/shared/models/user-data.model';

@Component({
  selector: 'app-appointment-view-modal',
  templateUrl: './appointment-view-modal.component.html',
  styleUrls: ['./appointment-view-modal.component.css'],
})
export class AppointmentViewModalComponent implements OnInit {
  constructor(
    public activeModal: NgbActiveModal,
    private appointmentService: AppointmentsService
  ) {}

  @Input() appointment: Appointment;
  @Input() user: UserData;
  @Input() physioView: boolean;

  loading: boolean = false;
  deletedAppointment: boolean = false;
  faCheckCircle = faCheckCircle;

  ngOnInit(): void {}

  deleteAppointment() {
    this.deletedAppointment = true;
    this.appointmentService.deleteAppointment(
      this.appointment.physioUid,
      this.appointment.key
    );
  }
}
