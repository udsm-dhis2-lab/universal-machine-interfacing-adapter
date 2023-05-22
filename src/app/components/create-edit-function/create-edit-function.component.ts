import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DatabaseService } from "../../services/database.service";
import { DatabaseResponse } from "../../shared/interfaces/db.interface";
import {
  FxPayload,
  FxRequest,
  FxResponse,
  SecretPayload,
} from "../../shared/interfaces/fx.interface";
import { InfoComponent } from "../info/info.component";
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
  editingSecret: boolean;

  constructor(
    private service: DatabaseService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateEditFunctionComponent>,

    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.secretForm = this.data.secret
      ? this.data.secret
      : this.formBuilder.group({
          secretValue: this.formBuilder.array([this.addSecretsGroup()]),
          name: "",
          func_code: "",
          description: "",
        });
    this.dialogData = this.data;
    this.isFunction = data?.isFunction;
  }

  ngOnInit() {
    this.editingSecret = this.dialogData?.editingSecret;
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

  resetSecretForm = () => {
    this.editingSecret = false;
    this.secretForm = this.formBuilder.group({
      secretValue: this.formBuilder.array([this.addSecretsGroup()]),
      name: "",
      func_code: "",
      description: "",
    });
  };

  private getSecrets = () => {
    this.service
      .getSecrets()
      .then((res) => {
        this.loadedSecrets = (res || []).map((secret: SecretPayload) => {
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
  removePair(index: number): void {
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
    if (this.dialogData.id) {
      delete this.dialogData.isFunction;
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

  private addSecretsGroup(key?: any, value?: any): FormGroup {
    return this.formBuilder.group({
      key: key ?? "",
      value: value ?? "",
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

  private confirmDeleteSecret = (secret: SecretPayload) => {
    const confirmDialog = this.dialog.open(InfoComponent, {
      width: "300px",
      height: "190px",
      data: { message: "You are about to delete this secret. Are you sure?" },
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleteSecret(secret);
      }
    });
  };

  private deleteSecret = (secret: SecretPayload) => {
    this.service
      .deleteSecret(secret.id)
      .then((res) => {
        this.getSecrets();
        this.openSnackBar(res);
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  };

  get validateFunction() {
    if (this.dialogData) return true;
    if (this.file && this.getValue("name") && this.getValue("name") !== "")
      return true;
    return false;
  }

  getSecretValue = (): any[] => {
    if (!this.secretForm.get("secretValue").value) return [];
    const secretForm = this.secretForm?.get("secretValue");
    if (!secretForm || !secretForm?.value) return [];
    return (this.secretForm?.get("secretValue")?.value || []).filter(
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
    const id = this.secretForm.get("id")?.value;
    this.service
      .createNewSecret({ value: JSON.stringify(value), name, description, id })
      .then((res) => {
        this.updateSecrets(res);
        this.resetSecretForm();
        this.openSnackBar({
          message: id ? "Secret Updated" : "Secret Saved",
          success: true,
        });
        this.getSecrets();
      })
      .catch((error) => {
        this.openSnackBar({ message: error.message, success: false });
      });
  }

  private updateSecrets = (res: DatabaseResponse | SecretPayload[]) => {
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

  onEditSecret(event: Event, secret: any): void {
    event.stopPropagation();
    this.secretForm = this.formBuilder.group(this.getSecret(secret));
    this.dialogRef.close();
    this.dialog.open(CreateEditFunctionComponent, {
      width: "65vw",
      height: "auto",
      disableClose: true,
      data: { isFunction: false, secret: this.secretForm, editingSecret: true },
    });
  }

  onDeleteSecret(event: Event, secret: any): void {
    event.stopPropagation();
    this.confirmDeleteSecret(secret);
  }

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  };

  private getSecret = (secret: SecretPayload) => {
    const secretValue = this.getParsedValue(secret.value);
    return { ...secret, secretValue: this.formBuilder.array(secretValue) };
  };

  private getParsedValue = (value: any) => {
    try {
      let values = [];
      value = JSON.parse(value);
      Object.keys(value).forEach((key) => {
        values = [...values, this.addSecretsGroup(key, value[key])];
      });
      return values;
    } catch (e) {
      return [];
    }
  };
}
