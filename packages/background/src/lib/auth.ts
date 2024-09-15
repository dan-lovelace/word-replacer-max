import { Hub, KeyValueStorageInterface } from "@aws-amplify/core";
import { Amplify } from "aws-amplify";
import { createUserPoolsTokenProvider } from "aws-amplify/adapter-core";

import { logDebug } from "@worm/shared";
import { getEnvConfig } from "@worm/shared/src/config";
import {
  storageGetByKeys,
  storageRemoveByKeys,
  storageSetByKeys,
} from "@worm/shared/src/storage";

type StorageAuthKey = (typeof storageAuthSuffixes)[number];

const envConfig = getEnvConfig();
const userPoolClientId = envConfig.VITE_COGNITO_USER_POOL_CLIENT_ID;
const userPoolEndpoint = envConfig.VITE_COGNITO_USER_POOL_ENDPOINT;
const userPoolId = envConfig.VITE_COGNITO_USER_POOL_ID;

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

const tokenProvider = createUserPoolsTokenProvider(
  {
    Cognito: {
      userPoolClientId,
      userPoolEndpoint,
      userPoolId,
    },
  },
  storageInterface
);

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolClientId,
        userPoolEndpoint,
        userPoolId,
      },
    },
  },
  {
    Auth: {
      tokenProvider,
    },
  }
);

Hub.listen("auth", (event) => {
  logDebug("Hub auth event", event);
});
