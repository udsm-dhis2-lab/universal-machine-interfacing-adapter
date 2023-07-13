// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { CheckBox } from "../../shared/modules/forms/models/check-box.model";
import { FormValue } from "../../shared/modules/forms/models/form-value.model";
import { omit } from "lodash";

@Component({
  selector: "app-shared-checkbox-form",
  templateUrl: "./shared-checkbox-form.component.html",
  styleUrls: ["./shared-checkbox-form.component.scss"],
})
export class SharedCheckboxFormComponent implements OnInit {
  @Input() list: any[];
  @Input() defaultSelectedItems: any;
  formFields: any[];
  values: any = {};
  @Output() optionValues: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    if (this.defaultSelectedItems) {
      Object.keys(this.defaultSelectedItems).forEach((key) => {
        this.values[key] = (this.list?.filter(
          (item) => Number(item?.id) === Number(key)
        ) || [])[0];
      });
    }
  }

  onFieldUpdate(event: MatCheckboxChange, item: any): void {
    if (event.checked) {
      this.values[item?.id] = item;
    } else {
      this.values = omit(this.values, item?.id);
    }
    this.optionValues.emit(this.values);
  }
}
