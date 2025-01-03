import { KeyValueStorageInterface } from "@aws-amplify/core";

import { getEnvConfig } from "@worm/shared/src/config";
import { getStorageProvider } from "@worm/shared/src/storage";

type StorageAuthKey = (typeof storageAuthSuffixes)[number];

const envConfig = getEnvConfig();
const userPoolClientId = envConfig.VITE_SSM_USER_POOL_CLIENT_ID;

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

export const sessionStorageProvider = getStorageProvider("local");

export const sessionStorageInterface: KeyValueStorageInterface = {
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
          return resolve(authLastAuthUser as string);
        case "accessToken":
          return resolve(authAccessToken as string);
        case "clockDrift":
          return resolve(authClockDrift as string);
        case "idToken":
          return resolve(authIdToken as string);
        case "refreshToken":
          return resolve(authRefreshToken as string);
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
