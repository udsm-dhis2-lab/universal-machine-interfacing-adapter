// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

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
