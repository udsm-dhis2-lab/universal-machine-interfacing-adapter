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
  constructor(private store: ElectronStoreService, private router: Router) {}

  ngOnInit(): void {
    this.keyedCurrentPrivileges = this.store.get("keyedUserPrivileges");
  }

  logOut(event: Event): void {
    event.stopPropagation();
    this.store.set("loggedin", false);
    this.store.set("keyedUserPrivileges", {});
    this.store.set("privileges", {});
    this.store.set("userid", null);
    this.store.set("roleids", null);
    this.router.navigate(["/home"]);
  }

  onRouteTo(event: Event, route: string): void {
    event.stopPropagation();
    this.router.navigate(["/" + route]);
  }
}
