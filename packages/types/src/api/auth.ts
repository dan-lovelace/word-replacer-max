import { AppUser } from "../identity";

import { ApiResponse } from "./";

export type ApiAuthAcceptTermsRequest = undefined;

export type ApiAuthAcceptTermsResponse = ApiResponse<undefined>;

export type ApiAuthDeleteAccountRequest = undefined;

export type ApiAuthDeleteAccountResponse = ApiResponse<undefined>;

export type ApiAuthTestTokensRequest = {
  password: string;
  username: string;
};

export type ApiAuthTokensRequest = {
  code: string;
};

export type ApiAuthTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

export type ApiAuthTokensResponse = ApiResponse<ApiAuthTokens>;

export type ApiAuthWhoAmiIRequest = undefined;

export type ApiAuthWhoAmI = AppUser;

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
