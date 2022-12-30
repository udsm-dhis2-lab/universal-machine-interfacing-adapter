import { Component, OnInit } from "@angular/core";
import { DatabaseService } from "../../services/database.service";

@Component({
  selector: "app-manage-user-privileges",
  templateUrl: "./manage-user-privileges.component.html",
  styleUrls: ["./manage-user-privileges.component.scss"],
})
export class ManageUserPrivilegesComponent implements OnInit {
  privileges: any[];
  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.databaseService.getPrivileges(
      (response: any[]) => {
        this.privileges = response;
      },
      (err) => {
        console.error(err);
      }
    );
  }
}
