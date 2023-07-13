// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DropdownOption } from "./dropdown-option.model";
import { Field } from "./field.model";

export interface ICAREForm {
  id: string;
  uuid: string;
  name: string;
  setMembers: ICAREForm[];
  options?: DropdownOption[];
  dataType?: string;
  formClass: string;
  formField?: Field<string>;
  formFields?: Field<string>[];
  concept?: any;
  isForm?: boolean;
}
