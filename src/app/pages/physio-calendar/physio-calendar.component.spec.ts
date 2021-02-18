import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysioCalendarComponent } from './physio-calendar.component';

describe('PhysioCalendarComponent', () => {
  let component: PhysioCalendarComponent;
  let fixture: ComponentFixture<PhysioCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhysioCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysioCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
