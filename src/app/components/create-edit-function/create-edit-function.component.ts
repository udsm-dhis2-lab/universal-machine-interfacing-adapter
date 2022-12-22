import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DatabaseService } from "../../services/database.service";
import {
  FxPayload,
  FxRequest,
  FxResponse,
} from "../../shared/interfaces/fx.interface";
import { ScheduleComponent } from "../schedule/schedule.component";

@Component({
  selector: "app-create-edit-function",
  templateUrl: "./create-edit-function.component.html",
  styleUrls: ["./create-edit-function.component.css"],
})
export class CreateEditFunctionComponent implements OnInit {
  formGroup: FormGroup;
  secretForm: FormGroup;
  loadedSecrets: any[];
  loading: boolean = false;
  response: any = null;
  file: File = null;
  dialogData: any;
  isFunction: boolean = true;
  constructor(
    private service: DatabaseService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateEditFunctionComponent>,

    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.secretForm = this.formBuilder.group({
      secretValue: this.formBuilder.array([this.addSecretsGroup()]),
      name: "",
      description: "",
    });

    this.dialogData = this.data;
  }

  ngOnInit() {
    this.createForm();
    this.getSecrets();
    if (this.dialogData) {
      this.onEdit();
    }
  }

  onEdit() {
    Object.keys(this.dialogData).forEach((key) => {
      this.formGroup.patchValue({ [key]: this.dialogData[key] });
    });
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

  getValue(input: string) {
    return this.formGroup.get(input).value;
  }

  reset() {
    this.formGroup.reset();
  }

  //Add Fields
  addSecretFields(): void {
    this.secrets.push(this.addSecretsGroup());
  }

  //Remove Fields
  removeAddress(index: number): void {
    this.secrets.removeAt(index);
  }

  //Fields Array
  get secrets(): FormArray {
    return <FormArray>this.secretForm.get("secretValue");
  }

  get validateSecret() {
    if (!this.secretForm.get("name").value) return false;
    if (this.getSecretValue().length === 0) return false;
    return true;
  }

  onChange(event: any) {
    this.file = event.target.files[0];
  }

  onSave = () => {
    const data = {
      name: this.getValue("name"),
      description: this.getValue("description"),
      frequency: this.getValue("frequency"),
      secret_id: this.getValue("secret_id"),
      file: this.file,
    };
    if (this.dialogData) {
      this.updateFunction({ ...this.dialogData, ...data });
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
    this.service
      .updateFunction(data)
      .then((res) => {
        this.openSnackBar(res);
        this.dialogRef.close(true);
      })
      .catch((e) => {
        this.openSnackBar({ message: e.message, success: false });
      });
  };

  saveNewFunction = (data: FxRequest) => {
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined || data[key] === null) {
        delete data[key];
      }
    });
    this.loading = !this.loading;
    this.service
      .createFunction(data)
      .then((res) => {
        this.response = res;
        this.dialogData = res;
        this.openSnackBar({ message: "Function Saved", success: true });
        this.dialogRef.close(true);
      })
      .catch((error) =>
        this.openSnackBar({ message: error.message, success: true })
      );
  };

  private addSecretsGroup(): FormGroup {
    return this.formBuilder.group({
      key: "",
      value: "",
    });
  }

  scheduleCron = (edit: boolean) => {
    const confirmDialog = this.dialog.open(ScheduleComponent, {
      width: "auto",
      height: "auto",
      disableClose: true,
      data: { fx: this.dialogData, edit },
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res && typeof res === "string") {
        this.formGroup.patchValue({ frequency: res });
      }
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

  get validate() {
    if (this.isFunction) return this.validateFunction;
    return this.validateSecret;
  }

  get validateFunction() {
    if (this.dialogData) return true;
    if (this.file && this.getValue("name") && this.getValue("name") !== "")
      return true;
    return false;
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
        this.updateSecrets(res);
        this.resetSecretFrom();
        this.openSnackBar({ message: "Secret Saved", success: true });
        this.getSecrets();
      })
      .catch((error) => {
        this.openSnackBar({ message: error.message, success: false });
      });
  }

  private updateSecrets = (res) => {
    this.loadedSecrets = [
      {
        ...(Array.isArray(res) ? res : res.rows[0]),
        display: Array.isArray(res)
          ? res[0].description
          : res.rows[0].description
          ? `${Array.isArray(res) ? res[0].name : res.rows[0].name}   ${
              Array.isArray(res)
                ? res[0].description
                : res.rows[0].description.substring(0, 10)
            }`
          : Array.isArray(res)
          ? res[0].name
          : res.rows[0].name,
      },
      ...this.loadedSecrets,
    ];
  };

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  };

  resetSecretFrom = () => {
    this.secretForm.reset();
  };
}
