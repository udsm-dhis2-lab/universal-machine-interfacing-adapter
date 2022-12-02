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
}

export interface FxResponse {
  success: boolean;
  message: string;
}
