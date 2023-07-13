// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUserPrivilegesComponent } from './manage-user-privileges.component';

describe('ManageUserPrivilegesComponent', () => {
  let component: ManageUserPrivilegesComponent;
  let fixture: ComponentFixture<ManageUserPrivilegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageUserPrivilegesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageUserPrivilegesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
