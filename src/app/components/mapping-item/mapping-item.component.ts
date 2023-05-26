import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Textbox } from "../../shared/modules/forms/models/text-box.model";
import { FormValue } from "../../shared/modules/forms/models/form-value.model";

@Component({
  selector: "app-mapping-item",
  templateUrl: "./mapping-item.component.html",
  styleUrls: ["./mapping-item.component.scss"],
})
export class MappingItemComponent implements OnInit {
  @Input() itemType: string;
  @Input() label: string;
  @Input() reference: any;
  @Input() data: any;
  mappingField: any;
  @Output() mappingReference: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.mappingField = new Textbox({
      id: "item",
      key: "item",
      value: this.data?.value,
      label: this.label ? this.label : "Machine",
      required: true,
    });
  }

  getMapping(formValue: FormValue): void {
    if (formValue?.getValues()?.item?.value) {
      let data = {};
      data[this.reference?.uuid] = {
        value: formValue?.getValues()?.item?.value,
        itemType: this.itemType,
      };
      this.mappingReference.emit(data);
    }
  }
}
