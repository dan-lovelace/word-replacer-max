import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import {
  AuthConfig,
  Hub,
  KeyValueStorageInterface,
  OAuthConfig,
} from "@aws-amplify/core";

import { logDebug } from "@worm/shared";
import { getEnvConfig } from "@worm/shared/src/config";
import {
  storageGetByKeys,
  storageRemoveByKeys,
  storageSetByKeys,
} from "@worm/shared/src/storage";

type StorageAuthKey = (typeof storageAuthSuffixes)[number];

const envConfig = getEnvConfig();
const userPoolClientId = envConfig.VITE_SSM_USER_POOL_CLIENT_ID;
const userPoolEndpoint = envConfig.VITE_SSM_USER_POOL_PROVIDER_URL;
const userPoolId = envConfig.VITE_SSM_USER_POOL_ID;

/**
 * These are the suffixes of storage keys used by Amplify when getting/setting.
 * There are others not currently in use; this list is non-exhaustive:
 *
 * - `deviceGroupKey`
 * - `deviceKey`
 * - `randomPasswordKey`
 * - `signInDetails`
 */
const storageAuthSuffixes = [
  "LastAuthUser", // NOTE: capitalized

  "accessToken",
  "clockDrift",
  "idToken",
  "refreshToken",
] as const;

const storageAuthKeyPrefix = `CognitoIdentityServiceProvider.${userPoolClientId}`;

const storageInterface: KeyValueStorageInterface = {
  clear: () =>
    new Promise(async (resolve) => {
      await storageRemoveByKeys([
        "authAccessToken",
        "authClockDrift",
        "authIdToken",
        "authLastAuthUser",
        "authRefreshToken",
      ]);

      resolve();
    }),
  getItem: (key: string) =>
    new Promise(async (resolve) => {
      const keyParts = key.split(".");
      const suffix = keyParts[keyParts.length - 1] as StorageAuthKey;

      if (
        !key.startsWith(storageAuthKeyPrefix) ||
        !storageAuthSuffixes.includes(suffix)
      ) {
        return resolve(null);
      }

      const {
        authAccessToken = null,
        authClockDrift = null,
        authIdToken = null,
        authLastAuthUser = null,
        authRefreshToken = null,
      } = await storageGetByKeys();

      switch (suffix) {
        case "LastAuthUser":
          return resolve(authLastAuthUser);
        case "accessToken":
          return resolve(authAccessToken);
        case "clockDrift":
          return resolve(authClockDrift);
        case "idToken":
          return resolve(authIdToken);
        case "refreshToken":
          return resolve(authRefreshToken);
        default:
          resolve(null);
      }
    }),
  setItem: (key: string, value: string) =>
    new Promise(async (resolve) => {
      const keyParts = key.split(".");
      const suffix = keyParts[keyParts.length - 1] as StorageAuthKey;

      if (
        !key.startsWith(storageAuthKeyPrefix) ||
        !storageAuthSuffixes.includes(suffix)
      ) {
        return resolve();
      }

      switch (suffix) {
        case "LastAuthUser":
          await storageSetByKeys({
            authLastAuthUser: value,
          });
          break;
        case "accessToken":
          await storageSetByKeys({
            authAccessToken: value,
          });
          break;
        case "clockDrift":
          await storageSetByKeys({
            authClockDrift: value,
          });
          break;
        case "idToken":
          await storageSetByKeys({
            authIdToken: value,
          });
          break;
        case "refreshToken":
          await storageSetByKeys({
            authRefreshToken: value,
          });
          break;
      }

      resolve();
    }),
  removeItem: (key: string) =>
    new Promise(async (resolve) => {
      if (key === undefined) {
        await storageRemoveByKeys([
          "authAccessToken",
          "authClockDrift",
          "authIdToken",
          "authLastAuthUser",
          "authRefreshToken",
        ]);

        return resolve();
      }

      const keyParts = key.split(".");
      const suffix = keyParts[keyParts.length - 1] as StorageAuthKey;

      if (
        !key.startsWith(storageAuthKeyPrefix) ||
        !storageAuthSuffixes.includes(suffix)
      ) {
        return resolve();
      }

      switch (suffix) {
        case "LastAuthUser":
          await storageRemoveByKeys(["authLastAuthUser"]);
          break;
        case "accessToken":
          await storageRemoveByKeys(["authAccessToken"]);
          break;
        case "clockDrift":
          await storageRemoveByKeys(["authClockDrift"]);
          break;
        case "idToken":
          await storageRemoveByKeys(["authIdToken"]);
          break;
        case "refreshToken":
          await storageRemoveByKeys(["authRefreshToken"]);
          break;
      }

      resolve();
    }),
};

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

cognitoUserPoolsTokenProvider.setKeyValueStorage(storageInterface);
cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);

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

Hub.listen("auth", (event) => {
  logDebug("Hub auth event", event);
});
