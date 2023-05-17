import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DatabaseService } from "../../../services/database.service";
import { Router } from "@angular/router";
import { FxResponse } from "../../../shared/interfaces/fx.interface";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-add-params",
  templateUrl: "./add-params.component.html",
  styleUrls: ["./add-params.component.scss"],
})
export class AddParamsComponent implements OnInit {
  codeParamsForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private db: DatabaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.codeParamsForm = this.formBuilder.group({
      parameters: this.formBuilder.array([this.addParametersGroup()]),
      answers: this.formBuilder.array([this.addAnswersGroup()]),
      lis_order: [
        "",
        {
          validators: [Validators.required],
        },
      ],
      test_order: [
        "",
        {
          validators: [Validators.required],
        },
      ],
    });
  }

  ngOnInit() {}

  private addParametersGroup(key?: any, value?: any): FormGroup {
    return this.formBuilder.group({
      answers: this.formBuilder.array([this.addAnswersGroup()]),
      key: key ?? "",
      value: value ?? "",
    });
  }

  private addAnswersGroup(i?: number, key?: any, value?: any): FormGroup {
    return this.formBuilder.group({
      key: key ?? "",
      value: value ?? "",
      i: i ?? "",
    });
  }

  onSave = () => {
    const data = {
      lis_order: this.getValue("lis_order"),
      test_order: this.getValue("test_order"),
      parameters: JSON.stringify(
        this.getValue("parameters")?.filter((parameter) => parameter.i != "")
      ),
      answers: JSON.stringify(
        this.getValue("answers")?.filter((answers) => answers.i != "")
      ),
    };

    console.log(data);

    this.db.genericAdd(
      data,
      "code_parameters",
      () => {
        this.openSnackBar({
          success: true,
          message: "Parameter created successfully",
        });
        this.router.navigate(["/coded"]);
      },
      (error) => {
        this.openSnackBar({ success: false, message: error });
      }
    );
  };

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  };

  getValue(input: string) {
    return this.codeParamsForm.get(input)?.value;
  }
  get parameters(): FormArray {
    return <FormArray>this.codeParamsForm.get("parameters");
  }
  get answers(): FormArray {
    return <FormArray>this.codeParamsForm.get("answers");
  }

  //Add Parameter Fields
  addParameterFields(): void {
    this.parameters.push(this.addParametersGroup());
  }
  //Add Answer Fields
  addAnswersFields(i: number): void {
    this.answers.push(this.addAnswersGroup(i));
  }

  //Remove Parameter Fields
  removePair(index: number): void {
    this.parameters.removeAt(index);
  }
  //Remove Answer Fields
  removeAnswer(paramter: number): void {
    const index = this.answers.controls.findIndex(
      (control) => control.value.i === paramter
    );
    this.answers.removeAt(index);
  }

  getAnswers = (i: number) => {
    return this.answers.controls.filter((control) => control?.value?.i === i);
  };
}
