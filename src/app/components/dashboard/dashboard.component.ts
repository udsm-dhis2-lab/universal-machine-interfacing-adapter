import { Component, OnInit, NgZone } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Router } from "@angular/router";
import { ElectronStoreService } from "../../services/electron-store.service";
import { InterfaceService } from "../../services/interface.service";
import { DatabaseResponse } from "../../shared/interfaces/db.interface";
import cron from "node-cron";

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
    "lims_sync_status",
    "lims_sync_date_time",
    "actions",
  ];

  statuses = {
    0: { icon: "🔵", color: "", spin: false },
    1: { icon: "✅", color: "", spin: false },
    2: { icon: "♻️", color: "", spin: true },
    3: { icon: "🚫", color: "", spin: false },
  };

  constructor(
    private store: ElectronStoreService,
    private _ngZone: NgZone,
    public interfaceService: InterfaceService,
    private router: Router
  ) {}

  ngOnInit() {
    const that = this;
    // that.runCron();

    that.appSettings = that.store.get("appSettings");

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
      that.lastLimsSync = data.lastLimsSync;
      that.lastResultReceived = (data.lastresultreceived || "")
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
}
