import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { CoreModule } from "./core/core.module";
import { SharedModule } from "./shared/shared.module";

import { AppRoutingModule } from "./app-routing.module";

// NG Translate
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { HomeModule } from "./home/home.module";

import { CommonModule } from "@angular/common";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CronEditorModule } from "ngx-cron-editor";
import { AppComponent } from "./app.component";
import { AddOrChangeSecretComponent } from "./components/add-or-change-secret/add-or-change-secret.component";
import { CreateEditFunctionComponent } from "./components/create-edit-function/create-edit-function.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { FunctionsComponent } from "./components/functions/functions.component";
import { InfoComponent } from "./components/info/info.component";
import { LogsComponent } from "./components/logs/logs.component";
import { ManageUserPrivilegesComponent } from "./components/manage-user-privileges/manage-user-privileges.component";
import { ManageUserRolesComponent } from "./components/manage-user-roles/manage-user-roles.component";
import { ManageUsersComponent } from "./components/manage-users/manage-users.component";
import { ScheduleComponent } from "./components/schedule/schedule.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { SharedCheckboxFormComponent } from "./components/shared-checkbox-form/shared-checkbox-form.component";
import { ElectronService } from "./core/services";
import { DatabaseService } from "./services/database.service";
import { ElectronStoreService } from "./services/electron-store.service";
import { InterfaceService } from "./services/interface.service";
import { CodeParamsComponent } from "./components/code-params/home/code-params.component";
import { AddParamsComponent } from "./components/code-params/add-params/add-params.component";
import { ParameterTableComponent } from "./components/code-params/parameter-table/parameter-table.component";

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, "./assets/i18n/", ".json");

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    DashboardComponent,
    FunctionsComponent,
    LogsComponent,
    InfoComponent,
    AddOrChangeSecretComponent,
    ScheduleComponent,
    CreateEditFunctionComponent,
    ManageUserPrivilegesComponent,
    ManageUserRolesComponent,
    ManageUsersComponent,
    SharedCheckboxFormComponent,
    CodeParamsComponent,
    AddParamsComponent,
    ParameterTableComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule,
    HomeModule,
    AppRoutingModule,
    CronEditorModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    ElectronService,
    DatabaseService,
    InterfaceService,
    ElectronStoreService,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline" },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
