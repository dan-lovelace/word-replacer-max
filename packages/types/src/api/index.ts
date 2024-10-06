export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export * from "./auth";
export * from "./share";
export * from "./suggest";
