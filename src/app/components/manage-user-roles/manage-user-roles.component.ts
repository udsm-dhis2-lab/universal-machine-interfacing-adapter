import { Component, OnInit } from "@angular/core";
import { DatabaseService } from "../../services/database.service";

@Component({
  selector: "app-manage-user-roles",
  templateUrl: "./manage-user-roles.component.html",
  styleUrls: ["./manage-user-roles.component.scss"],
})
export class ManageUserRolesComponent implements OnInit {
  roles: any[];
  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.databaseService.getRoles(
      (response: any[]) => {
        this.roles = response;
      },
      (err) => {
        console.error(err);
      }
    );
  }
}
