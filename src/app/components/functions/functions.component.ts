import { Component, NgZone, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { InterfaceService } from "../../services/interface.service";
import {
  FxPayload,
  FxRequest,
  FxResponse,
} from "../../shared/interfaces/fx.interface";
import { AddOrChangeSecretComponent } from "../add-or-change-secret/add-or-change-secret.component";
import { InfoComponent } from "../info/info.component";

@Component({
  selector: "app-functions",
  templateUrl: "./functions.component.html",
  styleUrls: ["./functions.component.scss"],
})
export class FunctionsComponent implements OnInit {
  formGroup: FormGroup;
  actionsClicked: boolean = false;
  pageSizeOptions: any[] = [5, 10, 50, 100];
  totalRows: number;
  loading: boolean = false; // Flag variable
  file: File = null; //
  response: any = null;
  fxRunning: boolean;
  processes: FxPayload[] = [];
  pageSize: number = 10;
  currentPage: number = 0;
  liveLogText: any[] = [];
  selectedFx: FxPayload;
  createNewFunction: boolean = false;
  displayedColumns: string[] = ["name", "description", "frequency", "actions"];
  secretForm: FormGroup;
  loadedSecrets: any[];

  constructor(
    private service: DatabaseService,
    private router: Router,
    private formBuilder: FormBuilder,
    private interfaceService: InterfaceService,
    private _ngZone: NgZone,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.secretForm = this.formBuilder.group({
      secretValue: this.formBuilder.array([this.addSecretsGroup()]),
      name: "",
      description: "",
    });
  }

  ngOnInit() {
    this.interfaceService.liveLog.subscribe((mesg) => {
      this._ngZone.run(() => {
        this.liveLogText = mesg;
      });
    });
    this.createForm();
    this.loadFunctions();
  }

  private getSecrets = () => {
    this.service
      .getSecrets()
      .then((res) => {
        this.loadedSecrets = (res || []).map((secret) => {
          return {
            ...secret,
            display: secret.description
              ? `${secret.name}   ${secret.description.substring(0, 10)}`
              : secret.name,
          };
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  private addSecretsGroup(): FormGroup {
    return this.formBuilder.group({
      key: "",
      value: "",
    });
  }

  onSaveSecrets() {
    const values = this.getSecretValue();
    const value = {};
    values.forEach((data) => {
      value[data.key] = data.value;
    });
    const name = this.secretForm.get("name").value;
    const description = this.secretForm.get("description").value;
    this.service
      .createNewSecret({ value, name, description })
      .then((res) => {
        this.loadedSecrets = [
          {
            ...res.rows[0],
            display: res.rows[0].description
              ? `${res.rows[0].name}   ${res.rows[0].description.substring(
                  0,
                  10
                )}`
              : res.rows[0].name,
          },
          ...this.loadedSecrets,
        ];
        this.resetSecretFrom();
        this.openSnackBar({ message: "Secret Saved", success: true });
      })
      .catch((error) => {
        this.openSnackBar({ message: error.message, success: false });
      });
  }

  resetSecretFrom = () => {
    this.secretForm.reset();
  };

  //Add Fields
  addSecretFields(): void {
    this.secrets.push(this.addSecretsGroup());
  }

  //Remove Fields
  removeAddress(index: number): void {
    this.secrets.removeAt(index);
  }

  get validateSecret() {
    if (
      !this.secretForm.get("name").value ||
      !this.secretForm.get("description").value
    )
      return false;
    if (this.getSecretValue().length === 0) return false;
    return true;
  }

  getSecretValue = (): any[] => {
    if (!this.secretForm.get("secretValue").value) return [];
    return this.secretForm
      .get("secretValue")
      .value.filter(
        (data: { key: string; value: string }) =>
          data.key !== "" && data.value !== ""
      );
  };

  //Fields Array
  get secrets(): FormArray {
    return <FormArray>this.secretForm.get("secretValue");
  }

  navigateToDashboard() {
    this.router.navigate(["./dashboard"]);
  }
  newFunction() {
    this.getSecrets();
    this.createNewFunction = !this.createNewFunction;
  }

  addOrChangeSecret(fx: FxPayload) {
    const confirmDialog = this.dialog.open(AddOrChangeSecretComponent, {
      width: "300px",
      height: "190px",
      data: fx,
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleteFx(fx);
      }
    });
  }

  loadFunctions = () => {
    this.reset();
    this.createNewFunction = false;
    this.service
      .getProcesses({ page: this.currentPage, pageSize: this.pageSize })
      .then((res) => {
        this.processes = res.data;
        this.totalRows = res.count;
      });
  };

  createForm() {
    this.formGroup = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null],
      frequency: [null],
      secret_id: [null],
      validate: "",
    });
  }

  onChange(event: any) {
    this.file = event.target.files[0];
  }

  onEdit(fx: FxPayload) {
    this.getSecrets();
    this.createNewFunction = true;
    this.selectedFx = fx;
    Object.keys(fx).forEach((key) => {
      this.formGroup.patchValue({ [key]: fx[key] });
    });
  }

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  };

  getValue(input: string) {
    return this.formGroup.get(input).value;
  }

  onSave = () => {
    const data = {
      name: this.getValue("name"),
      description: this.getValue("description"),
      frequency: this.getValue("frequency"),
      secret_id: this.getValue("secret_id"),
      file: this.file,
    };

    if (this.selectedFx) {
      this.updateFunction({ ...this.selectedFx, ...data });
    } else {
      this.saveNewFunction(data);
    }
  };

  updateFunction = (data: FxPayload) => {
    Object.keys(data).forEach((key) => {
      if (!data[key]) {
        delete data[key];
      }
    });
    this.service.updateFunction(data).then((res) => {
      this.selectedFx = null;
      this.openSnackBar(res);
      this.loadFunctions();
    });
  };

  saveNewFunction = (data: FxRequest) => {
    Object.keys(data).forEach((key) => {
      if (!data[key]) {
        delete data[key];
      }
    });
    this.loading = !this.loading;
    this.service.createFunction(data).then((res) => {
      this.response = res;
      this.loadFunctions();
    });
  };

  reset() {
    this.formGroup.reset();
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadFunctions();
  }

  onRun = (fx: FxPayload) => {
    this.service.run(fx.id).then((res) => {
      this.liveLogText = [
        `<span> <span class="text-info">[Info]</span> ${res}</span>`,
      ];
    });
  };

  onDelete = (fx: FxPayload) => {
    const confirmDialog = this.dialog.open(InfoComponent, {
      width: "300px",
      height: "190px",
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleteFx(fx);
      }
    });
  };

  private deleteFx = (fx: FxPayload) => {
    this.service.deleteProcesses(fx.id).then((res) => {
      this.openSnackBar(res);
      this.loadFunctions();
    });
  };
}
