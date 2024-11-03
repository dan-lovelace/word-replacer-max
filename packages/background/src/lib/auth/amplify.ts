import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  cognitoUserPoolsTokenProvider,
  signOut,
} from "aws-amplify/auth/cognito";

import {
  AuthConfig,
  Hub,
  KeyValueStorageInterface,
  OAuthConfig,
} from "@aws-amplify/core";

import { logDebug } from "@worm/shared";
import { getEnvConfig } from "@worm/shared/src/config";
import { getStorageProvider } from "@worm/shared/src/storage";
import { AppUser } from "@worm/types";

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
const sessionStorageProvider = getStorageProvider("session");

const storageInterface: KeyValueStorageInterface = {
  clear: () =>
    new Promise(async (resolve) => {
      await sessionStorageProvider.remove([
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

      const getRes = await sessionStorageProvider.get([
        "authAccessToken",
        "authClockDrift",
        "authIdToken",
        "authLastAuthUser",
        "authRefreshToken",
      ]);

      const {
        authAccessToken = null,
        authClockDrift = null,
        authIdToken = null,
        authLastAuthUser = null,
        authRefreshToken = null,
      } = getRes;

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
          await sessionStorageProvider.set({
            authLastAuthUser: value,
          });
          break;
        case "accessToken":
          await sessionStorageProvider.set({
            authAccessToken: value,
          });
          break;
        case "clockDrift":
          await sessionStorageProvider.set({
            authClockDrift: value,
          });
          break;
        case "idToken":
          await sessionStorageProvider.set({
            authIdToken: value,
          });
          break;
        case "refreshToken":
          await sessionStorageProvider.set({
            authRefreshToken: value,
          });
          break;
      }

      resolve();
    }),
  removeItem: (key: string) =>
    new Promise(async (resolve) => {
      if (key === undefined) {
        await sessionStorageProvider.remove([
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
          await sessionStorageProvider.remove(["authLastAuthUser"]);
          break;
        case "accessToken":
          await sessionStorageProvider.remove(["authAccessToken"]);
          break;
        case "clockDrift":
          await sessionStorageProvider.remove(["authClockDrift"]);
          break;
        case "idToken":
          await sessionStorageProvider.remove(["authIdToken"]);
          break;
        case "refreshToken":
          await sessionStorageProvider.remove(["authRefreshToken"]);
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

export const getCurrentUser = async (forceRefresh: boolean = false) => {
  const authSession = await fetchAuthSession({ forceRefresh });
  const email = authSession.tokens?.idToken?.payload.email?.toString();

  if (!email) {
    return undefined;
  }

  return { email };
};

export const signUserOut = () => {
  return signOut();
};
