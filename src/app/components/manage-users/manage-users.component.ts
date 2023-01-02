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
  saving: boolean = false;
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

  createUserFields(user?: any): void {
    this.userFields = [
      new Textbox({
        id: "username",
        key: "username",
        label: "Username",
        value: user?.username,
        required: true,
      }),
      new Textbox({
        id: "firstname",
        key: "firstname",
        label: "Firstname",
        value: user?.firstname,
        required: true,
      }),
      new Textbox({
        id: "middlename",
        key: "middlename",
        label: "Middlename",
        value: user?.middlename,
        required: false,
      }),
      new Textbox({
        id: "lastname",
        key: "lastname",
        label: "Lastname",
        value: user?.lastname,
        required: true,
      }),
      new Textbox({
        id: "title",
        key: "title",
        label: "Title",
        value: user?.title,
        required: false,
      }),
      new Textbox({
        id: "password",
        key: "password",
        label: "Password",
        type: "password",
        value: user?.password,
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
    this.saving = true;
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
            setTimeout(() => {
              this.getList();
              this.createUserFields();
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

  getRolesSelected(roles: any): void {
    this.selectedRoles = roles;
  }

  onEdit(user: any): void {
    this.createUserFields(user);
  }
}
