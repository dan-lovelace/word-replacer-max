import { ApiMarketingSignupRequest } from "./marketing";
import { NewApiUsageRecord } from "./usage";

export type EventSource = keyof EventSourceMap;

export type EventSourceMap = {
  "api.usage": NewApiUsageRecord;
  "cognito.signup": ApiMarketingSignupRequest;
  "marketing.signup": ApiMarketingSignupRequest;
};
