// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { CustomFormModule } from "./forms/forms.module";
import { materialModules } from "./material.modules";
export const modules: any[] = [CustomFormModule, ...materialModules];
