// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Component, OnInit } from "@angular/core";
import { ElectronStoreService } from "../../services/electron-store.service";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-select-machine",
  templateUrl: "./select-machine.component.html",
  styleUrls: ["./select-machine.component.scss"],
})
export class SelectMachineComponent implements OnInit {
  machines: any[] = [];
  selected: any;
  selectedRow: number;
  currentPage = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20, 50];
  toolType: { id: string; name: string }[] = [
    { id: "tcpserver", name: "Server (TCP/IP)" },
    { id: "tcpclient", name: "Client (TCP/IP)" },
  ];
  columns = ["name", "host", "mode", "port"];

  constructor(
    private store: ElectronStoreService,
    private dialogRef: MatDialogRef<SelectMachineComponent>
  ) {}

  ngOnInit() {
    this.machines = this.store.get("multiSettings");
  }

  getConnectionType = (id: string) =>
    this.toolType.find((tool) => tool.id === id)?.name;

  save = () => {
    this.store.set("appSettings", this.selected);
    this.dialogRef.close(true);
  };
}
