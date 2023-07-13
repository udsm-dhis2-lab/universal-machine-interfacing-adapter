// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUserRolesComponent } from './manage-user-roles.component';

describe('ManageUserRolesComponent', () => {
  let component: ManageUserRolesComponent;
  let fixture: ComponentFixture<ManageUserRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageUserRolesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageUserRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
