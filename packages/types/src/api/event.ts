import { ApiMarketingSignupRequest } from "./marketing";
import { NewApiUsageRecord } from "./usage";

export type EventSource = keyof EventSourceMap;

export type EventSourceMap = {
  "api.usage": NewApiUsageRecord;
  "marketing.signup": ApiMarketingSignupRequest;
};
