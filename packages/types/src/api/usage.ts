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
