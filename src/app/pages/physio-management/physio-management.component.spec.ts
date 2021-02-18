import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysioManagementComponent } from './physio-management.component';

describe('PhysioManagementComponent', () => {
  let component: PhysioManagementComponent;
  let fixture: ComponentFixture<PhysioManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhysioManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysioManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
