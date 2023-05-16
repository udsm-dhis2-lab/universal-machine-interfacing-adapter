import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-add-params",
  templateUrl: "./add-params.component.html",
  styleUrls: ["./add-params.component.scss"],
})
export class AddParamsComponent implements OnInit {
  codeParamsForm: FormGroup;
  constructor(private formBuilder: FormBuilder) {
    this.codeParamsForm = this.formBuilder.group({
      secretValue: this.formBuilder.array([this.addSecretsGroup()]),
      lis_order: "",
      test_order: "",
    });
  }

  ngOnInit() {}

  private addSecretsGroup(key?: any, value?: any): FormGroup {
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
}
