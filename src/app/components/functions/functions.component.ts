// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Component, NgZone, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { InterfaceService } from "../../services/interface.service";
import { FxPayload, FxResponse } from "../../shared/interfaces/fx.interface";
import { AddOrChangeSecretComponent } from "../add-or-change-secret/add-or-change-secret.component";
import { CreateEditFunctionComponent } from "../create-edit-function/create-edit-function.component";
import { InfoComponent } from "../info/info.component";
import { ScheduleComponent } from "../schedule/schedule.component";

@Component({
  selector: "app-functions",
  templateUrl: "./functions.component.html",
  styleUrls: ["./functions.component.scss"],
})
export class FunctionsComponent implements OnInit {
  actionsClicked: boolean = false;
  pageSizeOptions: any[] = [5, 10, 50, 100];
  totalRows: number;
  fxRunning: boolean;
  processes: FxPayload[] = [];
  pageSize: number = 10;
  currentPage: number = 0;
  liveLogText: any[] = [];
  displayedColumns: string[] = ["name", "description", "frequency", "actions"];

  constructor(
    private service: DatabaseService,
    private router: Router,
    private interfaceService: InterfaceService,
    private _ngZone: NgZone,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.interfaceService.liveLog.subscribe((mesg) => {
      this._ngZone.run(() => {
        this.liveLogText = mesg;
      });
    });
    this.loadFunctions();
    // this.runCron();
  }

  onEdit(fx: FxPayload) {
    this.newFunction(fx);
  }

  scheduleCron = (fx: FxPayload, edit: boolean) => {
    const confirmDialog = this.dialog.open(ScheduleComponent, {
      width: "auto",
      height: "auto",
      disableClose: true,
      data: { fx, edit },
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res && typeof res === "boolean") {
        this.loadFunctions();
      }
    });
  };

  navigateToDashboard() {
    this.router.navigate(["./dashboard"]);
  }
  newFunction(data?: any) {
    const createFunctionDialog = this.dialog.open(CreateEditFunctionComponent, {
      width: "65vw",
      height: "auto",
      disableClose: true,
      data: data ? { ...data, isFunction: true } : { isFunction: true },
    });
    createFunctionDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.loadFunctions();
      }
    });
  }

  onCancel = (fx: FxPayload) => {
    this.service
      .updateFunction({ id: fx.id, running: 0 } as FxPayload)
      .then((res) => {
        this.openSnackBar({ ...res, message: "Function cancelled" });
        this.loadFunctions();
      })
      .catch((e) => {
        this.openSnackBar({ message: e.message, success: false });
      });
  };
  secrets(): void {
    const createFunctionDialog = this.dialog.open(CreateEditFunctionComponent, {
      width: "65vw",
      height: "auto",
      disableClose: true,
      data: { isFunction: false },
    });
    createFunctionDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.loadFunctions();
      }
    });
  }

  addOrChangeSecret(fx: FxPayload) {
    const confirmDialog = this.dialog.open(AddOrChangeSecretComponent, {
      width: "45vw",
      height: "auto",
      disableClose: true,
      data: fx,
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.loadFunctions();
      }
    });
  }

  loadFunctions = () => {
    this.service
      .getProcesses({ page: this.currentPage, pageSize: this.pageSize })
      .then((res) => {
        this.processes = res.data;
        this.totalRows = res.count;
      });
  };

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  };

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadFunctions();
  }

  onRun = (fx: FxPayload) => {
    this.service.run(fx.id).then((res) => {
      this.loadFunctions();
      this.liveLogText = [
        `<span> <span class="text-info">[Info]</span> ${res}</span>`,
      ];
    });
  };

  onDelete = (fx: FxPayload) => {
    const confirmDialog = this.dialog.open(InfoComponent, {
      width: "300px",
      height: "190px",
      data: {
        message: "You are about to delete this function. Are you sure?",
      },
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleteFx(fx);
      }
    });
  };

  private deleteFx = (fx: FxPayload) => {
    this.service.deleteProcesses(fx.id).then((res) => {
      this.openSnackBar(res);
      this.loadFunctions();
    });
  };
}
