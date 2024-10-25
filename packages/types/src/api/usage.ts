import { ApiResponse, ApiRouteIdentifier } from "./";

export type ApiAccountUsage = Partial<
  Record<
    ApiRouteIdentifier,
    {
      count: number;
      label: string;
      limit: ApiUsageLimit;
    }
  >
>;

export type ApiAccountUsageResponse = ApiResponse<ApiAccountUsage>;

export type ApiUsageIdentifier = "replacement-suggestions";

export type ApiUsageLimit = {
  period: ApiUsageLimitPeriod;
  threshold: number;
};

export type ApiUsageLimitPeriod = {
  interval: ApiUsageLimitPeriodInterval;
  value: number;
};

export type ApiUsageLimitPeriodInterval = "days";

export type ApiUsageLimits = Partial<Record<ApiRouteIdentifier, ApiUsageLimit>>;

export type ApiUsageRecord = {
  cognitoId: string;
  endpoint: string;
  endpointTimestamp: string;
  expirationTime: number;
  responseTime: number;
  statusCode: number;
  timestamp: number;

  ipAddress?: string;
  requestMethod?: string;
  requestPayloadSize?: number;
  responsePayloadSize?: number;
  userAgent?: string;
};

export type NewApiUsageRecord = Omit<
  ApiUsageRecord,
  "endpointTimestamp" | "timestamp" | "expirationTime"
>;
