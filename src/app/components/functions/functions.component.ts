import { Component, NgZone, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
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
  processes: any[] = [];
  pageSize: number = 10;
  currentPage: number = 0;
  liveLogText: any[] = [];
  selectedFx: FxPayload;
  displayedColumns: string[] = ["name", "description", "frequency", "actions"];

  constructor(
    private service: DatabaseService,
    private router: Router,
    private formBuilder: FormBuilder,
    private interfaceService: InterfaceService,
    private _ngZone: NgZone,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.interfaceService.liveLog.subscribe((mesg) => {
      this._ngZone.run(() => {
        this.liveLogText = mesg;
      });
    });
    this.createForm();
    this.loadFunctions();
  }

  navigateToDashboard() {
    this.router.navigate(["./dashboard"]);
  }

  loadFunctions = () => {
    this.reset();
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
      description: [null, [Validators.required]],
      frequency: [null, [Validators.required]],
      validate: "",
    });
  }

  onChange(event: any) {
    this.file = event.target.files[0];
  }

  onEdit(fx: FxPayload) {
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
      file: this.file,
    };
    if (this.selectedFx) {
      this.updateFunction({ ...this.selectedFx, ...data });
    } else {
      this.saveNewFunction(data);
    }
  };

  updateFunction = (data: FxPayload) => {
    this.service.updateFunction(data).then((res) => {
      this.selectedFx = null;
      this.openSnackBar(res);
      this.loadFunctions();
    });
  };

  saveNewFunction = (data: FxRequest) => {
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
