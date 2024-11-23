import { ApiResponse } from "./";

export type ApiContactSupportRequest = {
  message: string;
};

export type ApiContactSupportResponse = ApiResponse<{
  success: true;
}>;
