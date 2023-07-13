// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedCheckboxFormComponent } from './shared-checkbox-form.component';

describe('SharedCheckboxFormComponent', () => {
  let component: SharedCheckboxFormComponent;
  let fixture: ComponentFixture<SharedCheckboxFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedCheckboxFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedCheckboxFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
