import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-physio-management',
  templateUrl: './physio-management.component.html',
  styleUrls: ['./physio-management.component.css'],
})
export class PhysioManagementComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  active: string = 'physio-calendar';
}
