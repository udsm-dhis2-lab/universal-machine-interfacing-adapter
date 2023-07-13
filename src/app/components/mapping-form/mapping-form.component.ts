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
import { sum } from "lodash";

@Component({
  selector: "app-mapping-form",
  templateUrl: "./mapping-form.component.html",
  styleUrls: ["./mapping-form.component.scss"],
})
export class MappingFormComponent implements OnInit, OnChanges {
  @Input() testOrder: any;
  testOrderColumns: number = 0;
  mappings: any = {};
  @Output() testParametersMapping: EventEmitter<any> = new EventEmitter<any>();
  answer: any;
  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.testOrder = {
      ...this.testOrder,
      parameters: this.testOrder?.parameters
        ? JSON.parse(this.testOrder?.parameters)
        : null,
      answers: this.testOrder?.answers
        ? JSON.parse(this.testOrder?.answers)
        : null,
    };
    this.testOrderColumns = sum(
      this.testOrder?.setMembers?.map((parameter: any) =>
        parameter?.answers?.length > 0 ? parameter?.answers?.length : 1
      )
    );
  }

  getMappingReference(mappings: any): void {
    this.mappings = { ...this.mappings, ...mappings };
    this.testParametersMapping.emit(this.mappings);
  }
}
