import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePhysioComponent } from './change-physio.component';

describe('ChangePhysioComponent', () => {
  let component: ChangePhysioComponent;
  let fixture: ComponentFixture<ChangePhysioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePhysioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePhysioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
