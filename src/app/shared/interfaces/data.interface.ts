// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export interface MachineData {
  order_id: string;
  test_id: string;
  test_type: string;
  test_unit: string;
  results: string;
  tested_by: string;
  patient_id: string;
  analysed_date_time: string;
  authorised_date_time: string;
  result_accepted_date_time: string;
  raw_text: string;
  result_status: number;
  lims_sync_status: number;
  test_location: string;
  machine_used: string;
}

export interface CodedParameters {
  id?: string;
  lis_order: string;
  test_order: string;
  parameters: Record<string, unknown>;
  answers: Record<string, unknown>;
  actions?: any;
}
