import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-add-params",
  templateUrl: "./add-params.component.html",
  styleUrls: ["./add-params.component.scss"],
})
export class AddParamsComponent implements OnInit {
  codeParamsForm: FormGroup;
  constructor(private formBuilder: FormBuilder) {
    this.codeParamsForm = this.formBuilder.group({
      parameters: this.formBuilder.array([this.addParametersGroup()]),
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

  private addAnswersGroup(key?: any, value?: any): FormGroup {
    return this.formBuilder.group({
      key: key ?? "",
      value: value ?? "",
    });
  }

  onSave = () => {
    const data = {
      lis_order: this.getValue("lis_order"),
      test_order: this.getValue("test_order"),
    };

    console.log(data);
  };

  getValue(input: string) {
    return this.codeParamsForm.get(input)?.value;
  }
  get secrets(): FormArray {
    return <FormArray>this.codeParamsForm.get("secretValue");
  }
}
