type ApiResponseName = "InternalServerError" | "InvalidRequestBody";

export type ApiResponse<T> = {
  data?: T;
  error?: {
    name: ApiResponseName;
    details?: any;
  };
};

export * from "./auth";
export * from "./share";
export * from "./suggest";
