import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { sum } from "lodash";

@Component({
  selector: "app-mapping-form",
  templateUrl: "./mapping-form.component.html",
  styleUrls: ["./mapping-form.component.scss"],
})
export class MappingFormComponent implements OnInit {
  @Input() testOrder: any;
  testOrderColumns: number = 0;
  mappings: any = {};
  @Output() testParametersMapping: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.testOrderColumns = sum(
      this.testOrder?.setMembers?.map((parameter: any) =>
        parameter?.answers?.length > 0 ? parameter?.answers?.length : 1
      )
    );
  }

  getMappingReference(mappings: any): void {
    this.mappings = { ...this.mappings, ...mappings };
    this.testParametersMapping.emit(this.mappings);
  }
}
