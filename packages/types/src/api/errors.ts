export interface ApiError {
  action: string;
  code: ApiErrorCode;
  help: string;
  message: string;
  statusCode: number;
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "INTERNAL_ERROR"
  | "INVALID_OAUTH"
  | "INVALID_REQUEST"
  | "INVALID_TOKEN"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "UNAUTHORIZED"
  | "USAGE_LIMIT"
  | "VALIDATION_ERROR";

export type ApiErrorName =
  | "BadAuthentication"
  | "InvalidOAuthCode"
  | "InvalidRequestBody"
  | "InternalServerError"
  | "MalformedToken"
  | "NotAllowed"
  | "RateLimitExceeded"
  | "ResourceNotFound"
  | "Standard"
  | "UsageLimitExceeded"
  | "ValidationError";

export const apiResponseErrors: Record<ApiErrorName, ApiError> = {
  BadAuthentication: {
    action: "Sign in or provide valid authentication credentials",
    code: "UNAUTHORIZED",
    help: "The request lacks valid authentication credentials",
    message: "Authentication is required to access this resource",
    statusCode: 401,
  },

  InvalidOAuthCode: {
    action: "Request a new authorization code and try again",
    code: "INVALID_OAUTH",
    help: "OAuth codes are temporary and must be used shortly after being issued",
    message: "The provided OAuth authorization code is invalid or expired",
    statusCode: 403,
  },

  InvalidRequestBody: {
    action: "Review the API documentation and validate your request format",
    code: "INVALID_REQUEST",
    help: "The provided request data doesn't match the expected format",
    message: "The request contains invalid or missing data",
    statusCode: 400,
  },

  InternalServerError: {
    action: "Please try again later. If the problem persists, contact support",
    code: "INTERNAL_ERROR",
    help: "This is a server-side issue and our team has been notified",
    message: "We encountered an unexpected error while processing your request",
    statusCode: 500,
  },

  MalformedToken: {
    action:
      "Obtain a new authentication token and ensure it's properly included in your request",
    code: "INVALID_TOKEN",
    help: "The token may be expired, corrupted, or incorrectly constructed",
    message: "The authentication token is invalid or improperly formatted",
    statusCode: 401,
  },

  NotAllowed: {
    action:
      "Contact your administrator to request access or upgrade your account",
    code: "FORBIDDEN",
    help: "Your account lacks the required permissions for this operation",
    message: "You don't have permission to perform this action",
    statusCode: 403,
  },

  RateLimitExceeded: {
    action: "Wait before retrying or upgrade your plan for higher limits",
    code: "RATE_LIMIT",
    help: "Your account is limited to a certain number of requests per time period",
    message: "You've exceeded the allowed number of requests",
    statusCode: 429,
  },

  ResourceNotFound: {
    action: "Verify the resource identifier and ensure it exists",
    code: "NOT_FOUND",
    help: "The specified resource ID or path does not exist",
    message: "The requested resource could not be found",
    statusCode: 404,
  },

  Standard: {
    action: "Check your request parameters and try again",
    code: "BAD_REQUEST",
    help: "The server cannot process the request due to invalid syntax or parameters",
    message: "The request could not be processed",
    statusCode: 400,
  },

  UsageLimitExceeded: {
    action: "Upgrade your subscription to increase your usage limits",
    code: "USAGE_LIMIT",
    help: "Your current plan has a limit on the number of times you can use this feature",
    message: "You've reached your usage limit for this feature",
    statusCode: 403,
  },

  ValidationError: {
    action: "Check the error details for specific validation failures",
    code: "VALIDATION_ERROR",
    help: "One or more fields contain invalid values",
    message: "The provided data failed validation",
    statusCode: 400,
  },
};
