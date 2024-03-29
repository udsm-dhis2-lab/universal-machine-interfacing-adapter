// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeRoutingModule } from "./home/home-routing.module";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { FunctionsComponent } from "./components/functions/functions.component";
import { ManageUserPrivilegesComponent } from "./components/manage-user-privileges/manage-user-privileges.component";
import { ManageUserRolesComponent } from "./components/manage-user-roles/manage-user-roles.component";
import { ManageUsersComponent } from "./components/manage-users/manage-users.component";
import { PageNotFoundComponent } from "./shared/components/page-not-found/page-not-found.component";
import { CodeParamsComponent } from "./components/code-params/home/code-params.component";
import { AddParamsComponent } from "./components/code-params/add-params/add-params.component";
import { MappingHomeComponent } from "./pages/mapping-home/mapping-home.component";
import { WorksheetHomeComponent } from "./pages/worksheet-home/worksheet-home.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    component: DashboardComponent,
  },
  {
    path: "settings",
    component: SettingsComponent,
  },
  {
    path: "functions",
    component: FunctionsComponent,
  },
  {
    path: "privileges",
    component: ManageUserPrivilegesComponent,
  },
  {
    path: "roles",
    component: ManageUserRolesComponent,
  },
  {
    path: "users",
    component: ManageUsersComponent,
  },
  {
    path: "coded",
    component: CodeParamsComponent,
  },
  {
    path: "add-coded",
    component: AddParamsComponent,
  },
  {
    path: "mapping",
    component: MappingHomeComponent,
  },
  {
    path: "worksheet",
    component: WorksheetHomeComponent,
  },
  {
    path: "**",
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" }),
    HomeRoutingModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
