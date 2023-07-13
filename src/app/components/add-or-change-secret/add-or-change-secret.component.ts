// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CronOptions, CronGenComponent } from "ngx-cron-editor";
import { DatabaseService } from "../../services/database.service";
import { FxPayload, FxResponse } from "../../shared/interfaces/fx.interface";

@Component({
  selector: "app-add-or-change-secret",
  templateUrl: "./add-or-change-secret.component.html",
  styleUrls: ["./add-or-change-secret.component.scss"],
})
export class AddOrChangeSecretComponent implements OnInit {
  dialogData: FxPayload;
  secrets: any[];
  secret_id: number;
  saving: boolean;
  constructor(
    private dialogRef: MatDialogRef<AddOrChangeSecretComponent>,
    private snackBar: MatSnackBar,
    private service: DatabaseService,
    @Inject(MAT_DIALOG_DATA) private data: FxPayload
  ) {
    this.dialogData = this.data;
  }

  ngOnInit(): void {
    this.getSecrets();
  }

  private getSecrets = () => {
    this.service
      .getSecrets()
      .then((res) => {
        this.secrets = (res || []).map((secret) => {
          return {
            ...secret,
            display: secret.description
              ? `${secret.name}   ${secret.description.substring(0, 10)}`
              : secret.name,
          };
        });
      })
      .catch((e) => {
        this.openSnackBar({ message: e.message, success: false });
      });
  };

  onSave = () => {
    this.saving = true;
    Object.keys(this.dialogData).forEach((key) => {
      if (!this.dialogData[key] && this.dialogData[key] === false) {
        delete this.dialogData[key];
      }
    });
    this.service
      .updateFunction({ ...this.dialogData, secret_id: this.secret_id })
      .then(() => {
        this.openSnackBar({ message: "Secret Added", success: true });
        this.saving = false;
        this.dialogRef.close(true);
      })
      .catch((e) => {
        this.openSnackBar({ message: e.message, success: false });
        this.saving = false;
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
}
