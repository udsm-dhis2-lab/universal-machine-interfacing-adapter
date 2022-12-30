import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { CheckBox } from "../../shared/modules/forms/models/check-box.model";
import { FormValue } from "../../shared/modules/forms/models/form-value.model";
import { omit } from "lodash";

@Component({
  selector: "app-shared-checkbox-form",
  templateUrl: "./shared-checkbox-form.component.html",
  styleUrls: ["./shared-checkbox-form.component.scss"],
})
export class SharedCheckboxFormComponent implements OnInit {
  @Input() list: any[];
  formFields: any[];
  values: any = {};
  @Output() optionValues: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.formFields = this.list?.map((item) => {
      return new CheckBox({
        id: item?.id,
        key: item?.id,
        label: item?.name,
        required: true,
      });
    });
  }

  onFormUpdate(formValue: FormValue): void {
    console.log(formValue.getValues());
  }

  onFieldUpdate(event: MatCheckboxChange, item: any): void {
    if (event.checked) {
      this.values[item?.id] = item;
    } else {
      this.values = omit(this.values, item?.id);
    }
    this.optionValues.emit(this.values);
  }
}
