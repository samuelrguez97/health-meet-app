import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentViewModalComponent } from './appointment-view-modal.component';

describe('AppointmentViewModalComponent', () => {
  let component: AppointmentViewModalComponent;
  let fixture: ComponentFixture<AppointmentViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentViewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
