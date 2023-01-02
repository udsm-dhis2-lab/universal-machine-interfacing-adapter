import { Component, OnInit, NgZone } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Router } from "@angular/router";
import { ElectronStoreService } from "../../services/electron-store.service";
import { InterfaceService } from "../../services/interface.service";
import {
  DatabaseResponse,
  SettingsDB,
} from "../../shared/interfaces/db.interface";
import { readFileSync } from "fs";
import { ElectronService } from "../../core/services";
import { DatabaseService } from "../../services/database.service";
import { FxResponse } from "../../shared/interfaces/fx.interface";
import { MatSnackBar } from "@angular/material/snack-bar";
import { uniqBy } from "lodash";

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
  public lastLimsSync = "";
  public lastResultReceived = "";
  public machineName = "";
  public interval: any;
  public lastOrders: any;
  public liveLogText = [];
  pageSize: number = 10;
  currentPage: number = 0;
  pageSizeOptions: any[] = [5, 10, 50, 100];
  totalRows: number;
  displayedColumns: string[] = [
    "order_id",
    "results",
    "test_unit",
    "test_type",
    "tested_by",
    "tested_on",
    "can_sync",
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
    3: { icon: "🚫", color: "", spin: false, label: "Failed" },
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

  constructor(
    private store: ElectronStoreService,
    private _ngZone: NgZone,
    public interfaceService: InterfaceService,
    public electronService: ElectronService,
    private router: Router,
    private database: DatabaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const that = this;
    that.keyedCurrentPrivileges = that.store.get("keyedUserPrivileges");
    that.currentUserId = this.store.get("userid");
    that.appSettings = that.store.get("appSettings");
    that.checkDbConnectionAndMigrate(that.appSettings);
    if (
      null === that.appSettings ||
      undefined === that.appSettings ||
      !that.appSettings.analyzerMachinePort ||
      !that.appSettings.interfaceCommunicationProtocol ||
      !that.appSettings.analyzerMachineHost
    ) {
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
          that.reconnectButtonText = "Connect";
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
    }, 1000 * 60 * 5);
  }

  fetchLastOrders() {
    const that = this;
    that.interfaceService.fetchLastOrders(true);

    that.interfaceService.fetchLastSyncTimes((data: any) => {
      that.lastLimsSync = data?.lastLimsSync;
      that.lastResultReceived = (data?.lastresultreceived || "")
        .toString()
        .split("GMT+0300")
        .join("");
    });

    that.interfaceService.lastOrders.subscribe(
      (lastFewOrders: DatabaseResponse[] | any[]) => {
        that._ngZone.run(() => {
          this.totalRows =
            lastFewOrders[0]?.rowCount ?? lastFewOrders[0]?.length;
          that.lastOrders = lastFewOrders[0]?.rows ?? lastFewOrders[0];
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
    this.interfaceService.reconnect();
  }

  close() {
    this.interfaceService.closeConnection();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  private checkDbConnectionAndMigrate = async (appSettings) => {
    try {
      const settings: SettingsDB = {
        dbHost: appSettings.dbHost,
        dbPort: appSettings.dbPort,
        dbName: appSettings.dbName,
        dbUser: appSettings.dbUser,
        dbPassword: appSettings.dbPassword,
      };
      if (appSettings.hasExternalDB) {
        await this.query("SELECT * FROM current_catalog;", settings);
        await this.migrate(settings);
      }
    } catch (e) {
      new Notification("🚫", {
        body: e.message,
      });
    }
  };

  private migrate = async (settings: SettingsDB) => {
    try {
      const sql = readFileSync("./assets/tables.sql", "utf-8");
      await this.query(sql, settings);
      return;
    } catch (e) {
      return;
    }
  };

  private query(text: string, settings: SettingsDB): Promise<DatabaseResponse> {
    return new Promise((resolve, reject) => {
      new this.electronService.postgres({
        connectionString: `postgres://${settings.dbUser}:${settings.dbPassword}@${settings.dbHost}:${settings.dbPort}/${settings.dbName}`,
      })
        .query(text, [])
        .then((res: DatabaseResponse) => {
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  checkedCanSync = (canSync: string) => {
    return canSync.toLocaleLowerCase() === "false" ? false : true;
  };

  changeSyncStatus(checked: boolean, result: any) {
    this.database
      .updateOrder({ id: result.id, can_sync: checked })
      .then((res) => {
        console.log(res);
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
      (status: any) => {
        this.fetchLastOrders();
        if (
          this.currentOrderApprovalStatuses?.length ==
          this.appSettings.authorizationCount - 1
        ) {
          this.changeSyncStatus(true, order);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

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
              (status) => status?.user_id == this.store.get("userid")
            ) || []
          )?.length > 0;
      },
      (err) => {
        console.error(err);
      }
    );
  }
}
