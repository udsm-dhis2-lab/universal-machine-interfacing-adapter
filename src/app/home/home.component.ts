import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DatabaseService } from "../services/database.service";
import { ElectronStoreService } from "../services/electron-store.service";
import { keyBy } from "lodash";
import { shell } from "electron";
import { FxResponse } from "../shared/interfaces/fx.interface";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginResponse } from "../shared/interfaces/login.interface";
import { ElectronService } from "../core/services/electron/electron.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  public settings: any = {};
  public user: { login: string; password: string } = {
    login: "",
    password: "",
  };
  hide: boolean = true;
  externalLoginCheck: boolean = false;
  loggingIn: boolean = false;
  constructor(
    private router: Router,
    private store: ElectronStoreService,
    private databaseService: DatabaseService,
    private snackBar: MatSnackBar
  ) {
    this.databaseService.setDefaultDatabaseData();
    this.settings = this.store.get("appSettings");
    console.log(this.settings);
    if (this.settings && this.store.get("loggedin") === true) {
      this.store.set("loggedin", true);
      this.router.navigate(["/dashboard"]);
    } else {
      this.router.navigate(["/home"]);
    }
  }

  ngOnInit(): void {
    this.databaseService.scheduleFunctions();
  }

  public doLogin() {
    this.loggingIn = true;
    if (this.externalLoginCheck) {
      this.loginExternal();
    } else {
      this.loginInternal();
    }
  }

  private loginExternal = () => {
    this.databaseService
      .run(this.settings.functionId, {
        identifier: this.user.login,
        password: this.user.password,
        url: this.settings.externalLoginUrl,
        httpMethod: this.settings.httpMethod,
        authType: this.settings.authType,
        systemName: this.settings.systemName,
        moduleName: this.settings.moduleName,
      })
      .then((res: LoginResponse) => {
        if (res.success) {
          this.store.set("loggedin", true);
          this.store.set("userUuid", res?.user?.uuid);
          this.openSnackBar({
            success: true,
            message: `Successfully logged in with ${this.settings.systemName}`,
          });
          this.router.navigate(["/dashboard"]);
          localStorage.setItem("token", res.token);
        } else {
          this.openSnackBar(res);
        }
      })
      .catch((error) => {
        this.openSnackBar({
          success: false,
          message:
            error.response.data.error ||
            error.response.data.message ||
            error.message,
        });
      });
  };

  private loginInternal = () => {
    this.databaseService.getUserDetails(
      this.user.login,
      this.user.password,
      (res: any) => {
        if (res?.length > 0) {
          const roleIds = res.map((user) => {
            return user?.role_id;
          });
          this.store.set("loggedin", true);
          this.store.set("userid", res[0]?.id);
          this.store.set("roleids", roleIds);
          this.databaseService.getPrivilegesByRolesDetails(
            roleIds,
            (privilegeRes: any) => {
              this.store.set("priveleges", privilegeRes);
              this.store.set(
                "keyedUserPrivileges",
                keyBy(privilegeRes, "name")
              );

              if (!this.settings) {
                this.router.navigate(["/settings"]);
              } else {
                this.router.navigate(["/dashboard"]);
              }
            },
            (err) => {
              console.error(err);
            }
          );
        } else {
          this.systemNotification({
            type: "Error",
            body: "Oops! Wrong username or password.",
          });
          this.openSnackBar({
            success: false,
            message: "Oops! Wrong username or password.",
          });
          this.router.navigate([""]);
        }
      },
      (err) => {
        this.openSnackBar({ success: true, message: err.message });
      }
    );
  };

  systemNotification = ({ body, type }) => {
    new Notification(type, {
      body,
    });
  };

  openUrl = async () => {
    await shell.openExternal("https://dhis2.udsm.ac.tz");
  };

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
    this.loggingIn = false;
  };
}
