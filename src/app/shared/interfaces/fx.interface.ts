export interface FxRequest {
  file: File;
  name: string;
  description: string;
  frequency: string;
}
export interface PageDetails {
  page: number;
  pageSize: number;
}

export interface FxPayload {
  id: number;
  code: string;
  name: string;
  description: string;
  frequency: string;
  count: string;
  file?: File;
  secret_id?: number;
}

export interface FxResponse {
  success: boolean;
  message: string;
}

export interface SecretPayload {
  id?: number;
  name: string;
  description?: string;
  value: string;
}

export interface SyncReference {
  id?: number;
  order_id: number;
  sync_reference?: any;
  added_on: number;
}
