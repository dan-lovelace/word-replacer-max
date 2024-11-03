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

export type ApiRoute<T extends ApiRouteIdentifier> = ApiRoutes[T];

export type ApiRouteIdentifier = keyof ApiRoutes;

export type ApiRoutes = typeof API_ROUTES;

export const API_ROUTES = {
  "GET:accountUsage": "/account/usage",
  "GET:authWhoAmI": "/auth/whoami",
  "GET:healthCheck": "/",
  "POST:authAcceptTerms": "/auth/accept-terms",
  "POST:authTokens": "/auth/tokens",
  "POST:marketingSignup": "/marketing/signup",
  "POST:share": "/share",
  "POST:suggest": "/suggest",
} as const;

export * from "./auth";
export * from "./event";
export * from "./marketing";
export * from "./share";
export * from "./suggest";
export * from "./usage";
