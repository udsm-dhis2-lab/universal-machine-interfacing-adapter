// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ElectronStoreService } from "../../../services/electron-store.service";

@Component({
  selector: "app-top-menu-bar",
  templateUrl: "./top-menu-bar.component.html",
  styleUrls: ["./top-menu-bar.component.scss"],
})
export class TopMenuBarComponent implements OnInit {
  keyedCurrentPrivileges: any = {};
  token: string;
  constructor(private store: ElectronStoreService, private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem("token");
    this.keyedCurrentPrivileges = this.store.get("keyedUserPrivileges");
  }

  logOut(event: Event): void {
    event.stopPropagation();
    this.store.set("loggedin", false);
    this.store.set("keyedUserPrivileges", {});
    this.store.set("privileges", {});
    this.store.set("userid", null);
    this.store.set("roleids", null);
    localStorage.removeItem("token");
    const settings = this.store.get("appSettings");
    delete settings.analyzerMachineName;
    delete settings.analyzerMachinePort;
    delete settings.analyzerMachineHost;
    delete settings.interfaceConnectionMode;
    delete settings.interfaceAutoConnect;
    delete settings.interfaceCommunicationProtocol;
    this.store.set("appSettings", settings);
    this.router.navigate(["/home"]);
  }

  onRouteTo(event: Event, route: string): void {
    event.stopPropagation();
    this.router.navigate(["/" + route]);
  }
}
