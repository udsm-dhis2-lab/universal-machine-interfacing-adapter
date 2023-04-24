export interface MachineData {
  order_id: string
  test_id: string
  test_type: string
  test_unit: string
  results: string
  tested_by: string
  patient_id: string
  analysed_date_time: string
  authorised_date_time: string
  result_accepted_date_time: string
  raw_text: string
  result_status: number
  lims_sync_status: number
  test_location: string
  machine_used: string
}
