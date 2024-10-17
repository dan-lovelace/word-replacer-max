type ApiResponseName =
  | "InternalServerError"
  | "InvalidRequestBody"
  | "UsageLimitExceeded";

export type ApiResponse<T> = {
  data?: T;
  error?: {
    name: ApiResponseName;
    details?: any;
  };
};

export * from "./auth";
export * from "./event";
export * from "./share";
export * from "./suggest";
export * from "./usage";
