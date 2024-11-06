import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

import { AuthConfig, Hub, OAuthConfig } from "@aws-amplify/core";

import { logDebug } from "@worm/shared";
import { getEnvConfig } from "@worm/shared/src/config";

import { sessionStorageInterface } from "./session-store";

const envConfig = getEnvConfig();
const userPoolClientId = envConfig.VITE_SSM_USER_POOL_CLIENT_ID;
const userPoolEndpoint = envConfig.VITE_SSM_USER_POOL_PROVIDER_URL;
const userPoolId = envConfig.VITE_SSM_USER_POOL_ID;

const oauthConfig: OAuthConfig = {
  domain: envConfig.VITE_SSM_USER_POOL_CUSTOM_DOMAIN,
  redirectSignIn: [envConfig.VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN],
  redirectSignOut: [envConfig.VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT],
  responseType: envConfig.VITE_SSM_USER_POOL_OAUTH_RESPONSE_TYPE,
  scopes: envConfig.VITE_SSM_USER_POOL_OAUTH_SCOPES,
};

const authConfig: AuthConfig = {
  Cognito: {
    loginWith: {
      oauth: oauthConfig,
      username: true,
    },
    signUpVerificationMethod: "code",
    userPoolClientId,
    userPoolEndpoint,
    userPoolId,
  },
};

cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorageInterface);

/**
 * Amplify's configuration entrypoint.
 */
Amplify.configure(
  {
    Auth: authConfig,
  },
  {
    Auth: {
      tokenProvider: cognitoUserPoolsTokenProvider,
    },
  }
);

/**
 * Enable Amplify's Hub when in development mode.
 */
if (import.meta.env.DEV) {
  Hub.listen("auth", (event) => {
    logDebug("Auth event", event);
  });
}
