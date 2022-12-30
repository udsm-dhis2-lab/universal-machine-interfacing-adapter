import { AfterViewInit, Component, OnInit } from "@angular/core";
import { DatabaseService } from "../../services/database.service";
import { FormValue } from "../../shared/modules/forms/models/form-value.model";
import { Textbox } from "../../shared/modules/forms/models/text-box.model";

@Component({
  selector: "app-manage-users",
  templateUrl: "./manage-users.component.html",
  styleUrls: ["./manage-users.component.scss"],
})
export class ManageUsersComponent implements OnInit, AfterViewInit {
  users: any[] = [];
  userRoles: any[] = [];
  userFields: any[] = [];
  isFormValid: boolean = false;
  formData: any;
  selectedRoles: any;
  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.getList();
    this.createUserFields();
  }

  getList(): void {
    this.databaseService.getUsers(
      (response: any[]) => {
        this.users = response;
        this.getUserRoles();
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getUserRoles(): void {
    this.databaseService.getRoles(
      (response: any[]) => {
        this.userRoles = response;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  createUserFields(): void {
    this.userFields = [
      new Textbox({
        id: "username",
        key: "username",
        label: "Username",
        required: true,
      }),
      new Textbox({
        id: "firstname",
        key: "firstname",
        label: "Firstname",
        required: true,
      }),
      new Textbox({
        id: "middlename",
        key: "middlename",
        label: "Middlename",
        required: false,
      }),
      new Textbox({
        id: "lastname",
        key: "lastname",
        label: "Lastname",
        required: true,
      }),
      new Textbox({
        id: "title",
        key: "title",
        label: "Title",
        required: false,
      }),
      new Textbox({
        id: "password",
        key: "password",
        label: "Password",
        type: "password",
        required: true,
      }),
    ];
  }

  onFormUpdate(formValue: FormValue): void {
    this.isFormValid = formValue.isValid;
    this.formData = formValue.getValues();
  }

  onSave(event: Event): void {
    event.stopPropagation();
    const user = {
      firstname: this.formData?.firstname?.value,
      middlename: this.formData?.middlename?.value,
      lastname: this.formData?.lastname?.value,
      title: this.formData?.title?.value,
      username: this.formData?.username?.value,
      password: this.formData?.password?.value,
    };
    this.databaseService.addUser(
      user,
      (response) => {
        const roles = Object.keys(this.selectedRoles).map((key) => {
          return {
            role_id: Number(key),
            user_id: response[0]?.id,
          };
        });
        this.databaseService.addUserRolesRelationship(
          roles,
          (rolesResponse) => {
            this.getList();
            this.createUserFields();
          },
          (error) => {}
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getRolesSelected(roles: any): void {
    this.selectedRoles = roles;
  }
}
