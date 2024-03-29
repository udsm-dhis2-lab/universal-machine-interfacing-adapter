// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormValue } from '../../models/form-value.model';
import { ICAREForm } from '../../models/form.model';
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'app-repeatable-form',
  templateUrl: './repeatable-form.component.html',
  styleUrls: ['./repeatable-form.component.scss'],
})
export class RepeatableFormComponent implements OnInit {
  @Input() formObject: ICAREForm;
  @Input() formData: any;

  @Output() formUpdate = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {}

  onFormUpdate(formValue: FormValue): void {
    this.formUpdate.emit({
      [this.formObject.id]: {
        id: this.formObject.id,
        memberEntities: formValue.getValues(),
      },
    });
  }
}
