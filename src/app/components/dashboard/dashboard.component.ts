// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Component, NgZone, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { readFileSync } from "fs";
import { uniqBy } from "lodash";
import { ElectronService } from "../../core/services";
import { SelectMachineComponent } from "../../pages/select-machine/select-machine.component";
import { DatabaseService } from "../../services/database.service";
import { ElectronStoreService } from "../../services/electron-store.service";
import { InterfaceService } from "../../services/interface.service";
import { MachineData } from "../../shared/interfaces/data.interface";
import { DatabaseResponse } from "../../shared/interfaces/db.interface";
import { FxResponse } from "../../shared/interfaces/fx.interface";
import { InfoComponent } from "../info/info.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  public isConnected = false;
  public appSettings = null;
  public connectionInProcess = false;
  public reconnectButtonText = "Connect";
  lastLimsSync: string;
  lastResultReceived: string;
  public machineName = "";
  public interval: any;
  public lastOrders: any = [];
  public liveLogText = [];
  isDev: boolean;
  token: string;
  statsData: boolean;
  pageSize: number = 10;
  currentPage: number = 0;
  pageSizeOptions: any[] = [5, 10, 50, 100];
  totalRows: number;
  displayedColumns: string[] = [
    "order_id",
    "test_id",
    "tested_by",
    "tested_on",
    "can_sync",
    "test_type",
    "lims_sync_status",
    "lims_sync_date_time",
    "actions",
  ];

  statuses = {
    0: { icon: "🔵", color: "", spin: false, label: "Not synced" },
    1: { icon: "✅", color: "", spin: false, label: "Successfully synced" },
    SUCCESS: {
      icon: "✅",
      color: "",
      spin: false,
      label: "Successfully synced",
    },
    2: { icon: "♻️", color: "", spin: true, label: "Synching" },
    3: { icon: "🚫", color: "", spin: false, label: "Failed", hover: true },
    ERROR: { icon: "🚫", color: "", spin: false, label: "Failed", hover: true },
  };

  statusesForKey = uniqBy(
    Object.keys(this.statuses).map((key) => {
      return this.statuses[key];
    }),
    "label"
  );
  currentUserId: number;

  keyedCurrentPrivileges: any = {};
  currentOrderApprovalStatuses: any[] = [];
  currentUserHasAlreadyApproved: boolean = false;

  HL7MessageProcessor: any;
  public hl7parser = require("hl7parser");
  constructor(
    private store: ElectronStoreService,
    private _ngZone: NgZone,
    public interfaceService: InterfaceService,
    public electronService: ElectronService,
    private router: Router,
    private database: DatabaseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.isDev = this.store.get("isDev") === "false" ? true : false;
  }

  ngOnInit() {
    this.token = localStorage.getItem("token");
    const that = this;
    that.keyedCurrentPrivileges = that.store.get("keyedUserPrivileges");
    that.currentUserId = this.store.get("userid");
    that.appSettings = that.store.get("appSettings");
    if (that.appSettings) {
      that.reconnectButtonText = "Reconnect";
    }
    if (
      !that.appSettings?.authorizationCount ||
      that.appSettings?.authorizationCount === ""
    ) {
      that.displayedColumns = that.displayedColumns.filter(
        (column) => column !== "can_sync" && column !== "order_id"
      );
    }
    if (!that.appSettings) {
      that.router.navigate(["/settings"]);
    } else {
      that.machineName = that.appSettings.analyzerMachineName;
    }

    if (
      that.appSettings.interfaceAutoConnect !== undefined &&
      that.appSettings.interfaceAutoConnect !== null &&
      that.appSettings.interfaceAutoConnect === "yes"
    ) {
      setTimeout(() => {
        that.reconnect();
      }, 1000);
    }

    that.interfaceService.currentStatus.subscribe((status) => {
      that._ngZone.run(() => {
        that.isConnected = status;
      });
    });

    that.interfaceService.connectionAttemptStatus.subscribe((status) => {
      that._ngZone.run(() => {
        if (status === false) {
          that.connectionInProcess = false;
          if (that.appSettings) {
            that.reconnectButtonText = "Reconnect";
          } else {
            that.reconnectButtonText = "Connect";
          }
        } else {
          that.connectionInProcess = true;
          that.reconnectButtonText = "Please wait ...";
        }
      });
    });

    that.interfaceService.liveLog.subscribe((mesg) => {
      that._ngZone.run(() => {
        that.liveLogText = mesg;
      });
    });

    setTimeout(() => {
      // Let us fetch last few Orders and Logs on load
      that.fetchLastOrders();

      that.fetchRecentLogs();
    }, 400);

    // let us refresh last orders every 5 minutes
    that.interval = setInterval(() => {
      that.fetchLastOrders();
    }, 1000 * 60 * 1);
  }

  get shouldAuthorize() {
    return this.appSettings.authorizationCount &&
      this.appSettings.authorizationCount !== "" &&
      this.appSettings.authorizationCount > 0
      ? true
      : false;
  }

  get disableAction() {
    const disable =
      !this.keyedCurrentPrivileges["DO_FINAL_AUTHORIZATION"] &&
      !this.keyedCurrentPrivileges["DO_AUTHORIZE"] &&
      !this.keyedCurrentPrivileges["ALL"] &&
      this.shouldAuthorize;
    return disable;
  }

  fetchLastOrders() {
    const that = this;
    that.interfaceService.fetchLastOrders(true);

    that.interfaceService.fetchLastSyncTimes((data: any) => {
      data ? (this.statsData = true) : (this.statsData = false);
      const lastSyncTime = (data?.lims_sync_date_time ?? "")?.split(".")[0];
      const lastResultReceived = (data?.added_on ?? "")?.split(".")[0];
      that.lastResultReceived = `${this.getTimes(lastResultReceived)} ${
        lastResultReceived && lastResultReceived != ""
          ? "(" + new Date(lastResultReceived).toLocaleString() + ")"
          : ""
      }`;
      that.lastLimsSync = `${this.getTimes(lastSyncTime)} ${
        lastSyncTime && lastSyncTime !== ""
          ? "(" + new Date(lastSyncTime).toLocaleString() + ")"
          : ""
      }`;
    });

    that.interfaceService.lastOrders.subscribe(
      (lastFewOrders: DatabaseResponse[] | any[]) => {
        that._ngZone.run(() => {
          this.totalRows =
            lastFewOrders[0]?.rowCount ?? lastFewOrders[0]?.length;
          that.lastOrders = (lastFewOrders[0]?.rows ?? lastFewOrders[0]) || [];

          that.lastOrders = that.lastOrders?.map((order) => {
            return {
              ...order,
              analysed_date_time: this.getTimes(order.analysed_date_time),
              lims_sync_date_time: this.getTimes(order.lims_sync_date_time),
            };
          });
        });
      }
    );
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchRecentLogs();
  }

  fetchRecentLogs() {
    this.interfaceService.fetchRecentLogs();
  }

  clearLiveLog() {
    this.liveLogText = null;
    this.interfaceService.clearLiveLog();
  }

  reconnect() {
    const appSettings = this.store.get("appSettings");
    if (appSettings.analyzerMachineHost) {
      this.interfaceService.reconnect();
    } else {
      this.newConnection();
    }
  }

  newConnection = () => {
    const selectionDialog = this.dialog.open(SelectMachineComponent, {
      width: "50%",
      height: "auto",
    });
    selectionDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.appSettings = this.store.get("appSettings");
        this.interfaceService.reconnect();
      } else {
        this.openSnackBar({ message: "No machine selected", success: false });
      }
    });
  };

  close() {
    this.interfaceService.closeConnection();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  checkedCanSync = (canSync: string) => {
    if (!canSync) return false;
    return canSync.toLocaleLowerCase() === "false" ? false : true;
  };

  changeSyncStatus(checked: boolean, result: any) {
    this.database
      .updateOrder({ id: result.id, can_sync: checked })
      .then((res) => {
        this.openSnackBar({ message: "Status Updated", success: true });
      })
      .catch((e) => {
        this.openSnackBar({ message: e.message, success: false });
      });
  }

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  };

  onApproval(event: Event, order: any): void {
    event.stopPropagation();
    const status = {
      category: "AUTHORIZATION",
      status: "APPROVED",
      remarks: "APPROVED",
      order_id: order?.id,
      user_id: this.store.get("userid"),
    };
    this.database.setApprovalStatus(
      status,
      (results: any) => {
        this.sync();
        this.fetchLastOrders();
        if (
          this.currentOrderApprovalStatuses?.length ==
          this.appSettings.authorizationCount - 1
        ) {
          const orderIndex = this.lastOrders.findIndex(
            (last) => last.id === order.id
          );
          this.lastOrders[orderIndex] = { ...order, can_sync: "true" };
          this.changeSyncStatus(true, order);
          this.fetchLastOrders();
        }
      },
      (err) => {}
    );
  }

  sync = (data?: MachineData) => {
    if (this.appSettings.functionId && this.appSettings.functionId !== "") {
      this.database
        .run(this.appSettings.functionId, null, null, [data])
        .then((res) => {})
        .catch((e) => {});
    }
  };

  getApprovalInfos(event: Event, order: any): void {
    event.stopPropagation();
    this.currentOrderApprovalStatuses = [];
    this.database.getApprovalStatuses(
      order?.id,
      (statuses: any) => {
        this.currentOrderApprovalStatuses = statuses;
        this.currentUserHasAlreadyApproved =
          (
            statuses?.filter(
              (status: { user_id: any }) =>
                status?.user_id == this.store.get("userid")
            ) || []
          )?.length > 0;
      },
      (err) => {}
    );
  }

  testData = (type: "astm" | "hl7") => {
    if (type === "astm") {
      const data = readFileSync("./data.txt", "utf-8");
      this.interfaceService.processASTMConcatenatedData(data);
      this.fetchLastOrders();
      return;
    }
    const data = readFileSync("./hl7.txt", "utf-8");
    this.interfaceService.parseHL7DH76(data, true);
    this.fetchLastOrders();
  };

  onDelete = (element: any) => {
    const confirmDialog = this.dialog.open(InfoComponent, {
      width: "300px",
      height: "190px",
      data: {
        message: "You are about to delete this order. Are you sure?",
      },
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleteOrder(element);
      }
    });
  };

  getTimes = (date: string) => {
    if (!date || date == "") return "";
    const diffTime = new Date().getTime() - new Date(date).getTime();
    const days = Math.round(diffTime / (1000 * 3600 * 24));
    const hours = Math.round(diffTime / (1000 * 3600));
    const minutes = Math.round(diffTime / (1000 * 60));
    return this.getTime(days, hours, minutes);
  };

  private getTime = (days: number, hours: number, minutes: number) => {
    return days >= 1
      ? this.getSanitizedTime(days, "day")
      : hours >= 1
      ? this.getSanitizedTime(hours, "hour")
      : minutes >= 1
      ? this.getSanitizedTime(minutes, "minute")
      : "A few seconds ago";
  };

  private getSanitizedTime = (time: number, label: string) => {
    return `${time} ${time > 1 ? label + "s" : label} ago`;
  };

  private deleteOrder = (element: any) => {
    this.database
      .deleteOrder(element.id)
      .then((res) => {
        this.openSnackBar(res);
        this.fetchLastOrders();
      })
      .catch((e) => {
        this.openSnackBar({ message: e.message, success: false });
      });
  };
}
