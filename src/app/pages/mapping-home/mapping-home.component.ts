import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { Dropdown } from "../../shared/modules/forms/models/dropdown.model";
import { FormValue } from "../../shared/modules/forms/models/form-value.model";
import { Textbox } from "../../shared/modules/forms/models/text-box.model";
import { FxResponse } from "../../shared/interfaces/fx.interface";
import { MatSnackBar } from "@angular/material/snack-bar";

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
  mappings: any;
  mappingId: number;
  renderMappingForm: boolean = false;
  mappingInformationToEdit: any;
  constructor(
    private router: Router,
    private service: DatabaseService,
    private snackBar: MatSnackBar,
    private activateRoute: ActivatedRoute,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    this.mappingId = this.activateRoute.snapshot.queryParams["id"];
    await this.service.run(null, null, "TEST_ORDERS").then((res) => {
      if (res) {
        this.testOrders = res;
        if (this.mappingId) {
          this.getMappingToEdit(this.testOrders);
        } else {
          this.createLISTestOrderField(this.testOrders);
        }
      }
    });
  }

  getMappingToEdit(testOrders?: any[]): void {
    this.renderMappingForm = false;
    this.db
      .runQuery(`SELECT * FROM code_parameters WHERE id=${this.mappingId}`, [])
      .then((response) => {
        if (response?.data?.length > 0) {
          this.selectedTestOrder = null;
          setTimeout(() => {
            const testOrderUuid = response?.data[0]?.lis_order;
            this.selectedTestOrder = (testOrders?.filter(
              (testOrder) => testOrder?.uuid === testOrderUuid
            ) || [])[0];

            this.mappingInformationToEdit = {
              ...this.selectedTestOrder,
              ...response?.data[0],
            };
            this.createMachineTestOrderField(this.mappingInformationToEdit);
            this.createLISTestOrderField(
              testOrders,
              this.mappingInformationToEdit
            );
            this.openSnackBar({
              success: true,
              message: "Loaded mapping configurations!",
            });
            this.renderMappingForm = true;
          }, 200);
        }
      })
      .catch((error) => {
        this.createMachineTestOrderField();
        if (this.mappingId) {
          this.openSnackBar({ success: false, message: error });
        }
      });
  }

  createMachineTestOrderField(data?: any): void {
    this.machineTestOrderField = new Textbox({
      id: "machineTestOrder",
      key: "machineTestOrder",
      label: "Machine Test Code",
      value: data?.test_order,
      required: true,
    });
  }

  createLISTestOrderField(testOrders: any[], data?: any): void {
    this.testOrderField = new Dropdown({
      id: "testOrder",
      key: "testOrder",
      label: "Search Test order",
      shouldHaveLiveSearchForDropDownFields: false,
      required: true,
      value: {
        value: data?.uuid,
      },
      disabled: data?.uuid,
      controlType: "concept",
      options: testOrders?.map((testOrder: any) => {
        return {
          key: testOrder?.uuid,
          label: testOrder?.display?.replace("TEST_ORDERS:", ""),
          value: testOrder?.uuid,
          name: testOrder?.display?.replace("TEST_ORDERS:", ""),
        };
      }),
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

      this.selectedTestOrder = {
        ...this.selectedTestOrder,
        ...this.mappingInformationToEdit,
      };
    }, 50);
  }

  getMachineTestValue(formValueDetails: FormValue): void {
    this.testOrderMachineCode =
      formValueDetails.getValues()?.machineTestOrder?.value;
  }

  onGetTestParametersMapping(mappings: any): void {
    this.mappings = mappings;
  }

  onSave = () => {
    const data = {
      lis_order: this.selectedTestOrder.uuid,
      test_order: this.testOrderMachineCode,
      parameters: JSON.stringify(this.mappings),
      answers: JSON.stringify(this.mappings),
    };

    if (!this.mappingId) {
      this.service.genericAdd(
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
    } else {
      this.service.genericUpdate(
        { ...data, id: this.mappingId },
        "code_parameters",
        () => {
          this.openSnackBar({
            success: true,
            message: "Parameter updated successfully",
          });
          this.router.navigate(["/coded"]);
        },
        (error) => {
          this.openSnackBar({ success: false, message: error });
        }
      );
    }
  };

  onCancel(): void {
    this.router.navigate(["/coded"]);
  }

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  };

  get validResults() {
    return (
      this.testOrderMachineCode !== "" &&
      this.mappings !== "" &&
      this.mappings &&
      this.selectedTestOrder &&
      this.selectedTestOrder !== ""
    );
  }
}
