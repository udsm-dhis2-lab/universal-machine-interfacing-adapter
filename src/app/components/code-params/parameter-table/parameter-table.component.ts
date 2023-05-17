import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-parameter-table",
  templateUrl: "./parameter-table.component.html",
  styleUrls: ["./parameter-table.component.scss"],
})
export class ParameterTableComponent implements OnInit {
  @Input() data: any[];
  columns = ["key", "value", "answers"];

  constructor() {
    this.data = this.data?.filter((d) => d.key !== "");
  }

  ngOnInit() {}
}
