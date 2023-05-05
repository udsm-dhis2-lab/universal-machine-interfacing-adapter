import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { first } from "rxjs/operators";
import { ElectronService } from "../../core/services";
import { DatabaseService } from "../../services/database.service";
import { ElectronStoreService } from "../../services/electron-store.service";
import { FxPayload } from "../../shared/interfaces/fx.interface";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  public settings: any = {};
  public appPath: string = "";
  methods: string[] = ["POST", "GET", "PUT"];
  authTypes: string[] = ["Basic", "Bearer"];
  functions: any[];
  protocols: { id: string; name: string }[] = [
    { id: "astm-elecsys", name: "ASTM/Elecsys (Single Record)" },
    { id: "astm-concatenated", name: "ASTM (Concatenated)" },
    { id: "hl7", name: "HL7" },
    { id: "serial", name: "Serial" },
  ];

  toolType: { id: string; name: string }[] = [
    { id: "tcpserver", name: "Server (TCP/IP)" },
    { id: "tcpclient", name: "Client (TCP/IP)" },
  ];
  autoconnect: { id: string; name: string }[] = [
    { id: "yes", name: "Yes" },
    { id: "no", name: "No" },
  ];

  constructor(
    private router: Router,
    private store: ElectronStoreService,
    private service: DatabaseService,
    private _http: HttpClient
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
      this.settings.functionId = appSettings.functionId;
      this.settings.hasExternalLogin = appSettings.hasExternalLogin;
      this.settings.externalLoginUrl = appSettings.externalLoginUrl;
      this.settings.httpMethod = appSettings.httpMethod;
      this.settings.authType = appSettings.authType;
      this.settings.systemName = appSettings.systemName;
      this.settings.authorizationCount = appSettings.authorizationCount;
      this.settings.moduleName = appSettings.moduleName;
      this.settings.identifier = appSettings.identifier;
    }
  }

  ngOnInit(): void {
    if (this.settings.hasExternalLogin) {
      this.loadFunctions();
    }
  }

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
      hasExternalDB: that.settings?.hasExternalDB,
      authorizationCount: that.settings.authorizationCount,
      hasExternalLogin: that.settings.hasExternalLogin,
      externalLoginUrl: that.settings.externalLoginUrl,
      functionId: that.settings.functionId,
      httpMethod: that.settings.httpMethod,
      authType: that.settings.authType,
      systemName: that.settings.systemName,
      moduleName: that.settings.moduleName,
      identifier: that.settings.identifier,
    };
    try {
      that.store.set("appSettings", appSettings);
    } catch (e) {}
    const notificationOptions = {
      body: "Updated Successfully",
      icon: "assets/icons/favicon.png",
      timestamp: new Date().valueOf(),
      title: "",
      name: "",
    };
    new Notification("", notificationOptions);
    this.router.navigate(["/dashboard"]);
  };

  addDatabase = (checked: boolean) => {
    this.settings.hasExternalDB = checked;
  };

  hasExternalLogin = (checked: boolean) => {
    this.loadFunctions();
    this.settings.hasExternalLogin = checked;
  };

  loadFunctions = () => {
    this.service
      .getProcesses({ page: 0, pageSize: 100 })
      .then((res) => {
        this.functions = (Array.isArray(res) ? res : res.data).map(
          (fx: FxPayload) => {
            return {
              ...fx,
              display: `${fx.name} ${
                fx.description ? fx.description.substring(0, 20) : ""
              }`,
            };
          }
        );
      })
      .catch((e) => {});
  };

  ping = () => {
    this._http
      .get(this.settings.externalLoginUrl, { observe: "response" })
      .pipe(first())
      .subscribe((resp) => {
        console.log(resp.status);
        if (resp.status === 200) {
          console.log(resp);
        } else {
          console.log("RESP", resp);
        }
      }),
      (err: any) => console.log("ERR", err);
  };
}
