import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { DatabaseService } from "../../services/database.service";
import { CodedParameters } from "../../shared/interfaces/data.interface";
import { FxResponse } from "../../shared/interfaces/fx.interface";
import { MatSnackBar } from "@angular/material/snack-bar";
import { InfoComponent } from "../info/info.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-code-params",
  templateUrl: "./code-params.component.html",
  styleUrls: ["./code-params.component.scss"],
})
export class CodeParamsComponent implements OnInit {
  parameters = [];
  columns = ["order_test", "machine_test", "parameters", "answers", "actions"];
  totalRows = 0;
  currentPage = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20, 50];
  constructor(
    private db: DatabaseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadParameters();
  }

  pageChanged = (e: PageEvent) => {};

  onDelete = (parameter: CodedParameters) => {
    const confirmDialog = this.dialog.open(InfoComponent, {
      width: "300px",
      height: "190px",
      data: {
        message: `You are about to delete coded parameter [${
          parameter.lis_order ?? ""
        } ${parameter.test_order ?? ""}]. Are you sure?`,
      },
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.db
          .runQuery(`DELETE FROM code_parameters WHERE id=${parameter.id}`, [])
          .then(() => {
            this.loadParameters();
            this.openSnackBar({ success: true, message: "Parameter deleted!" });
          })
          .catch((error) => {
            this.openSnackBar({ success: false, message: error });
          });
      }
    });
  };

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  };

  loadParameters = () => {
    this.db
      .runQuery("SELECT * FROM code_parameters", [])
      .then((res) => {
        this.totalRows = res.count;
        this.parameters = res?.data ?? [];
      })
      .catch((error) => {
        console.log(error);
      });
  };
}
