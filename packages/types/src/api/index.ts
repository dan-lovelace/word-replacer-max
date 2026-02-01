import {
  ApiError,
  ApiErrorCode,
  ApiErrorName,
  apiResponseErrors,
} from "./errors";

export const API_ROUTES = {
  "GET:accountUsage": "/account/usage",
  "GET:authWhoAmI": "/auth/whoami",
  "GET:healthCheck": "/",
  "POST:authAcceptTerms": "/auth/accept-terms",
  "POST:authDeleteAccount": "/auth/delete-account",
  "POST:authTestTokens": "/auth/test-tokens",
  "POST:authTokens": "/auth/tokens",
  "POST:contactSupport": "/contact/support",
  "POST:marketingSignup": "/marketing/signup",
  "POST:share": "/share",
  "POST:suggest": "/suggest",
} as const;

export type ApiResponse<T> = {
  data?: T;
  error?: Omit<ApiResponseError, "statusCode">;
};

export type ApiRoute<T extends ApiRouteIdentifier> = ApiRoutes[T];

export type ApiRouteIdentifier = keyof ApiRoutes;

export type ApiRoutes = typeof API_ROUTES;

export class ApiResponseError extends Error implements ApiError {
  // Custom property to provide additional context in JSON format
  details: any;

  // ApiError properties
  action: string;
  code: ApiErrorCode;
  help: string;
  message: string;
  statusCode: number;

  constructor(name: ApiErrorName = "Standard", details?: any) {
    const { action, code, help, message, statusCode } = apiResponseErrors[name];

    super(message);

    this.details = details;

    this.action = action;
    this.code = code;
    this.help = help;
    this.message = message;
    this.name = name;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, ApiResponseError.prototype);
  }
}

export * from "./auth";
export * from "./contact";
export * from "./errors";
export * from "./event";
export * from "./marketing";
export * from "./share";
export * from "./usage";
