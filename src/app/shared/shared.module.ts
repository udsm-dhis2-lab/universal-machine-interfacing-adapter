// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TranslateModule } from "@ngx-translate/core";

import { sharedComponents } from "./components/";
import { WebviewDirective } from "./directives/";
import { FormsModule } from "@angular/forms";
import { modules } from "./modules";

@NgModule({
  declarations: [WebviewDirective, ...sharedComponents],
  imports: [CommonModule, TranslateModule, FormsModule, ...modules],
  exports: [
    TranslateModule,
    WebviewDirective,
    FormsModule,
    ...modules,
    ...sharedComponents,
  ],
})
export class SharedModule {}
