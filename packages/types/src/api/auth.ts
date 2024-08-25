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

export type ApiAuthTokensResponse = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

export type ApiCognitoTokensResponse = {
  access_token: string;
  id_token: string;
  refresh_token: string;
};
