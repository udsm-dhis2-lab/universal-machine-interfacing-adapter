import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { DatabaseService } from "../../../services/database.service";

@Component({
  selector: "app-add-params",
  templateUrl: "./add-params.component.html",
  styleUrls: ["./add-params.component.scss"],
})
export class AddParamsComponent implements OnInit {
  codeParamsForm: FormGroup;
  constructor(private formBuilder: FormBuilder, private db: DatabaseService) {
    this.codeParamsForm = this.formBuilder.group({
      parameters: this.formBuilder.array([this.addParametersGroup()]),
      answers: this.formBuilder.array([this.addAnswersGroup()]),
      lis_order: "",
      test_order: "",
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
      parameters: JSON.stringify(this.getValue("parameters")),
      answers: JSON.stringify(this.getValue("answers")),
    };
    this.db.genericAdd(
      data,
      "code_parameters",
      (res) => {
        console.log(res);
      },
      (error) => {
        console.log(error);
      }
    );
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
