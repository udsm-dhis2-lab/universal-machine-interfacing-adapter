import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DatabaseService } from "../services/database.service";
import { ElectronStoreService } from "../services/electron-store.service";
import { keyBy } from "lodash";

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
  constructor(
    private router: Router,
    private store: ElectronStoreService,
    private databaseService: DatabaseService
  ) {
    this.databaseService.setDefaultDatabaseData();
    this.settings = this.store.get("appSettings");
    if (
      undefined !== this.settings &&
      null !== this.settings &&
      undefined !== this.settings.interfaceAutoConnect &&
      null !== this.settings.interfaceAutoConnect &&
      "yes" === this.settings.interfaceAutoConnect &&
      this.store.get("loggedin") === true
    ) {
      this.store.set("loggedin", true);
      this.router.navigate(["/dashboard"]);
    } else {
      this.router.navigate(["/home"]);
    }
  }

  ngOnInit(): void {}

  public doLogin() {
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

              if (undefined === this.settings) {
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
          const myNotification = new Notification("Error", {
            body: "Oops! Wrong username or password.",
          });
          this.router.navigate([""]);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
