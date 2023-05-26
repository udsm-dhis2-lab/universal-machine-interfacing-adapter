import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { Dropdown } from "../../shared/modules/forms/models/dropdown.model";
import { FormValue } from "../../shared/modules/forms/models/form-value.model";
import { Textbox } from "../../shared/modules/forms/models/text-box.model";

@Component({
  selector: "app-mapping-home",
  templateUrl: "./mapping-home.component.html",
  styleUrls: ["./mapping-home.component.scss"],
})
export class MappingHomeComponent implements OnInit {
  code: string = "TEST_ORDERS";
  testOrders: any[] = [];
  testOrderField: any;
  selectedTestOrder: any;
  machineTestOrderField: any;
  testOrderMachineCode: string;
  constructor(private router: Router, private service: DatabaseService) {}

  async ngOnInit() {
    await this.service.run(null, null, "TEST_ORDERS").then((res) => {
      this.testOrders = res;
      this.testOrderField = new Dropdown({
        id: "testOrder",
        key: "testOrder",
        label: "Select test order",
        shouldHaveLiveSearchForDropDownFields: false,
        required: true,
        controlType: "concept",
        options: this.testOrders?.map((testOrder: any) => {
          return {
            key: testOrder?.uuid,
            label: testOrder?.display,
            value: testOrder?.uuid,
            name: testOrder?.display,
          };
        }),
      });
    });

    this.machineTestOrderField = new Textbox({
      id: "machineTestOrder",
      key: "machineTestOrder",
      label: "Machine Test Code",
      required: true,
    });
  }

  onRouteTo(event: Event, route: string): void {
    event.stopPropagation();
    this.router.navigate(["/" + route]);
  }

  onFormUpdate(formValueDetails: FormValue): void {
    const selectedTestOrderValue: any =
      formValueDetails.getValues()?.testOrder?.value;
    this.selectedTestOrder = null;
    setTimeout(() => {
      this.selectedTestOrder = (this.testOrders?.filter(
        (testOrder) => testOrder?.uuid === selectedTestOrderValue?.value
      ) || [])[0];
    }, 50);
  }

  getMachineTestValue(formValueDetails: FormValue): void {
    this.testOrderMachineCode =
      formValueDetails.getValues()?.machineTestOrder?.value;
  }

  onGetTestParametersMapping(mappings: any): void {
    console.log(mappings);
  }
}
