import { ApiResponse } from "./";

export type ApiMarketingSignupRequest = {
  contact: MarketingContact;

  /**
   * reCAPTCHA token.
   */
  token: string;
};

export type ApiMarketingSignupResponse = ApiResponse<{
  success: true;
}>;

export type MarketingContact = {
  email: string;
  firstName?: string;
};
