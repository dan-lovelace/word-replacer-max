import { ApiResponse } from "./";

export type ApiAuthTokensRequest = {
  code: string;
};

export type ApiAuthTokens =
  | {
      accessToken: string;
      idToken: string;
      refreshToken: string;
    }
  | undefined;

export type ApiAuthTokensResponse = ApiResponse<ApiAuthTokens>;

export type ApiAuthWhoAmI = {
  email: string;
  emailVerified: string;
};
export type ApiAuthWhoAmIResponse = ApiResponse<ApiAuthWhoAmI>;

export type ApiCognitoTokensResponse = {
  access_token: string;
  id_token: string;
  refresh_token: string;
};

export type ApiCognitoUserInfoResponse = {
  email: string;
  email_verified: string;
  sub: string;
  username: string;
};
