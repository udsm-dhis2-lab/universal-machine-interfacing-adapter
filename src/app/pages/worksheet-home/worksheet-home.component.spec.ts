import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksheetHomeComponent } from './worksheet-home.component';

describe('WorksheetHomeComponent', () => {
  let component: WorksheetHomeComponent;
  let fixture: ComponentFixture<WorksheetHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksheetHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorksheetHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
