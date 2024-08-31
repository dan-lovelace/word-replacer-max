export type AuthConfiguration = {
  oauth: {
    domain: string;
    scopes: string[];
    redirectSignIn: string;
    redirectSignOut: string;
  };
  region: string;
  userPoolClientId: string;
  userPoolId: string;
};

export type ApiAuthTokensRequest = {
  code: string;
};

export type ApiAuthTokensResponse = ApiResponse<{
  accessToken: string;
  idToken: string;
  refreshToken: string;
}>;

export type ApiCognitoTokensResponse = {
  access_token: string;
  id_token: string;
  refresh_token: string;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};
