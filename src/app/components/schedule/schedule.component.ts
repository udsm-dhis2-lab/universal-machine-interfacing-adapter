import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CronOptions, CronGenComponent } from "ngx-cron-editor";
import { DatabaseService } from "../../services/database.service";
import { FxPayload, FxResponse } from "../../shared/interfaces/fx.interface";

@Component({
  selector: "app-schedule",
  templateUrl: "./schedule.component.html",
  styleUrls: ["./schedule.component.scss"],
})
export class ScheduleComponent implements OnInit {
  public cronExpression = "";
  public isCronDisabled = false;
  public cronOptions: CronOptions = {
    formInputClass: "form-control cron-editor-input",
    formSelectClass: "form-control cron-editor-select",
    formRadioClass: "cron-editor-radio",
    formCheckboxClass: "cron-editor-checkbox",

    defaultTime: "00:00:00",

    hideMinutesTab: false,
    hideHourlyTab: false,
    hideDailyTab: false,
    hideWeeklyTab: false,
    hideMonthlyTab: false,
    hideYearlyTab: false,
    hideAdvancedTab: false,
    hideSpecificWeekDayTab: false,
    hideSpecificMonthWeekTab: false,

    use24HourTime: true,
    hideSeconds: false,

    cronFlavor: "standard",
  };

  @ViewChild("cronEditorDemo")
  cronEditorDemo: CronGenComponent;
  dialogData: FxPayload;
  cronForm: FormControl;

  constructor(
    private dialogRef: MatDialogRef<ScheduleComponent>,
    private snackBar: MatSnackBar,
    private service: DatabaseService,
    @Inject(MAT_DIALOG_DATA) private data: { fx: FxPayload; edit: boolean }
  ) {
    this.dialogData = this.data.fx;
  }
  ngOnInit() {
    this.cronForm = new FormControl(this.cronExpression);
    this.cronExpression = this.dialogData?.frequency;
  }

  cronFlavorChange() {
    this.cronEditorDemo.options = this.cronOptions;
  }

  onSave = () => {
    if (this.data.edit) {
      delete this.dialogData.code;
      this.service
        .updateFunction({
          ...this.dialogData,
          frequency: this.cronForm.value,
        })
        .then((res) => {
          this.openSnackBar(res);
          this.dialogRef.close(true);
        })
        .catch((err) => {
          this.openSnackBar({ success: false, message: err.message });
        });
    } else {
      this.dialogRef.close(this.cronForm.value);
    }
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
