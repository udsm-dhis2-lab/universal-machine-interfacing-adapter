// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/* tslint:disable:no-unused-variable */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { FieldControlService } from './field-control.service';

describe('Service: FieldControl', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FieldControlService]
    });
  });

  it('should ...', inject([FieldControlService], (service: FieldControlService) => {
    expect(service).toBeTruthy();
  }));
});
