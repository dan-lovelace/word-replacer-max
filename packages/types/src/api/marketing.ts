import { ApiResponse } from "..";

export type ApiMarketingSignupRequest = MarketingContact;

export type ApiMarketingSignupResponse = ApiResponse<{
  success: true;
}>;

export type MarketingContact = {
  email: string;
  firstName?: string;
};
