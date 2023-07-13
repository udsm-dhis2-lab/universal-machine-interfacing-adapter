// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export interface OpenMRSForm {
    uuid?: string;
    id?: string;
    display?: string;
    name?: string;
    description?: string;
    encounterType?: { uuid?: string;display?: string},
    version?: string;
    build?: null;
    published?: boolean;
    formFields?: any[];
    retired: boolean;
    resources: any[]
}