export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  code?: number;
}
