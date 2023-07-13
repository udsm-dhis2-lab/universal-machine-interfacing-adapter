// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-parameter-table",
  templateUrl: "./parameter-table.component.html",
  styleUrls: ["./parameter-table.component.scss"],
})
export class ParameterTableComponent implements OnInit {
  @Input() data: any[];
  columns = ["key", "value", "answers"];

  constructor() {
    this.data = this.data?.filter((d) => d.key !== "");
  }

  ngOnInit() {}
}
