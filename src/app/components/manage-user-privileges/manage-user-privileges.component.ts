// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Component, OnInit } from "@angular/core";
import { DatabaseService } from "../../services/database.service";

@Component({
  selector: "app-manage-user-privileges",
  templateUrl: "./manage-user-privileges.component.html",
  styleUrls: ["./manage-user-privileges.component.scss"],
})
export class ManageUserPrivilegesComponent implements OnInit {
  privileges: any[];
  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.databaseService.getPrivileges(
      (response: any[]) => {
        this.privileges = response;
      },
      (err) => {
        console.error(err);
      }
    );
  }
}
