// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingHomeComponent } from './mapping-home.component';

describe('MappingHomeComponent', () => {
  let component: MappingHomeComponent;
  let fixture: ComponentFixture<MappingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
