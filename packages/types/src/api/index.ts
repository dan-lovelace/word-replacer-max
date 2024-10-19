type ApiResponseName =
  | "InternalServerError"
  | "InvalidRequestBody"
  | "MalformedToken"
  | "NotAllowed"
  | "UsageLimitExceeded";

export type ApiResponse<T> = {
  data?: T;
  error?: ApiResponseError;
};

export type ApiResponseError = {
  name: ApiResponseName;
  details?: any;
};

export * from "./auth";
export * from "./event";
export * from "./marketing";
export * from "./share";
export * from "./suggest";
export * from "./usage";
