import { Component, OnInit } from "@angular/core";
import { DatabaseService } from "../../services/database.service";
import { FormValue } from "../../shared/modules/forms/models/form-value.model";
import { Textbox } from "../../shared/modules/forms/models/text-box.model";

@Component({
  selector: "app-manage-user-roles",
  templateUrl: "./manage-user-roles.component.html",
  styleUrls: ["./manage-user-roles.component.scss"],
})
export class ManageUserRolesComponent implements OnInit {
  roles: any[];
  formFields: any[];
  privileges: any[];
  selectedPrivileges: any[];
  formData: any;
  isFormValid: boolean = false;
  saving: boolean = false;
  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.getList();
    this.createRolesFormFields();
  }

  createRolesFormFields(): void {
    this.formFields = [
      new Textbox({
        id: "name",
        key: "name",
        label: "Name",
        required: true,
      }),
      new Textbox({
        id: "description",
        key: "description",
        label: "Description",
        required: true,
      }),
    ];
  }

  getList(): void {
    this.databaseService.getRoles(
      (response: any[]) => {
        this.roles = response;
        this.databaseService.getPrivileges(
          (privileges: any[]) => {
            this.privileges = privileges;
          },
          (err) => {
            console.error(err);
          }
        );
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getPrivilegesSelected(privileges: any): void {
    this.selectedPrivileges = privileges;
  }

  onFormUpdate(formValue: FormValue): void {
    this.isFormValid = formValue.isValid;
    this.formData = formValue.getValues();
  }

  onSave(event: Event): void {
    event.stopPropagation();
    const role = {
      name: this.formData?.name?.value,
      description: this.formData?.description?.value,
    };
    this.saving = true;
    this.databaseService.addRole(
      role,
      (response) => {
        const roles = Object.keys(this.selectedPrivileges).map((key) => {
          return {
            privilege_id: Number(key),
            role_id: response[0]?.id,
          };
        });
        this.databaseService.addRolesPrivilegeRelationship(
          roles,
          (rolePrivilegesResponse) => {
            setTimeout(() => {
              this.getList();
              this.createRolesFormFields();
              this.saving = false;
            }, 200);
          },
          (error) => {}
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
