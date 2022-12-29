import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ElectronService } from "../../core/services";
import { ElectronStoreService } from "../../services/electron-store.service";
import {
  DatabaseResponse,
  SettingsDB,
} from "../../shared/interfaces/db.interface";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  public settings: any = {};
  public appPath: string = "";

  constructor(
    private electronService: ElectronService,
    private router: Router,
    private store: ElectronStoreService
  ) {
    const appSettings = this.store.get("appSettings");
    this.appPath = this.store.get("appPath");

    if (appSettings) {
      this.settings.labID = appSettings.labID;
      this.settings.labName = appSettings.labName;

      this.settings.analyzerMachineName = appSettings.analyzerMachineName;
      this.settings.analyzerMachinePort = appSettings.analyzerMachinePort;
      this.settings.analyzerMachineHost = appSettings.analyzerMachineHost;
      this.settings.interfaceConnectionMode =
        appSettings.interfaceConnectionMode;
      this.settings.interfaceAutoConnect = appSettings.interfaceAutoConnect;
      this.settings.interfaceCommunicationProtocol =
        appSettings.interfaceCommunicationProtocol;

      this.settings.dbHost = appSettings.dbHost;
      this.settings.dbPort = appSettings.dbPort;
      this.settings.dbName = appSettings.dbName;
      this.settings.dbUser = appSettings.dbUser;
      this.settings.dbPassword = appSettings.dbPassword;
      this.settings.hasExternalDB = appSettings.hasExternalDB;
      this.settings.authorizationCount = appSettings.authorizationCount;
    }
  }

  ngOnInit(): void {}

  get isNew() {
    const appSettings = this.store.get("appSettings");
    if (appSettings && Object.values(this.settings).length > 0) return false;
    return true;
  }

  updateSettings = async () => {
    const that = this;

    const appSettings = {
      labID: that.settings.labID,
      labName: that.settings.labName,
      analyzerMachinePort: that.settings.analyzerMachinePort,
      analyzerMachineName: that.settings.analyzerMachineName,
      analyzerMachineHost: that.settings.analyzerMachineHost,
      interfaceConnectionMode: that.settings.interfaceConnectionMode,
      interfaceAutoConnect: that.settings.interfaceAutoConnect,
      interfaceCommunicationProtocol:
        that.settings.interfaceCommunicationProtocol,
      dbHost: that.settings.dbHost,
      dbPort: that.settings.dbPort,
      dbName: that.settings.dbName,
      dbUser: that.settings.dbUser,
      dbPassword: that.settings.dbPassword,
      hasExternalDB: that.settings.hasExternalDB,
      authorizationCount: that.settings.authorizationCount,
    };
    try {
      that.store.set("appSettings", appSettings);
    } catch (e) {}
    new Notification("✅", {
      body: "Updated interfacing settings",
      icon: "assets/icons/favicon.png",
      timestamp: new Date().valueOf(),
    });
    this.router.navigate(["/dashboard"]);
  };

  addDatabase = (checked: boolean) => {
    this.settings.hasExternalDB = checked;
  };

  async checDBConnection() {
    const settings: SettingsDB = {
      dbHost: this.settings.dbHost,
      dbPort: this.settings.dbPort,
      dbName: this.settings.dbName,
      dbUser: this.settings.dbUser,
      dbPassword: this.settings.dbPassword,
    };
    const that = this;
    try {
      await that.query("SELECT * FROM current_catalog;", settings);
      const dialogConfig = {
        type: "info",
        message:
          "DB Connected successfully. Please click on SAVE SETTINGS to update these settings.",
        buttons: ["OK"],
      };
      that.electronService.openDialog("showMessageBox", dialogConfig);
    } catch (err) {
      const dialogConfig = {
        type: "error",
        message:
          "Oops! Something went wrong! Unable to connect to the DB database on host " +
          that.settings.dbHost,
        detail:
          err +
          "\n\nPlease check if all the database connection settings are correct and the DB server is running.",
        buttons: ["OK"],
      };
      that.electronService.openDialog("showMessageBox", dialogConfig);
    }
  }

  private query(text: string, settings: SettingsDB): Promise<DatabaseResponse> {
    return new Promise((resolve, reject) => {
      new this.electronService.postgres({
        connectionString: `postgres://${settings.dbUser}:${
          settings.dbPassword
        }@${settings.dbHost}:${settings.dbPort || 5432}/${settings.dbName}`,
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
}
