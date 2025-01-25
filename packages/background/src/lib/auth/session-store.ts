import { KeyValueStorageInterface } from "@aws-amplify/core";

import { getStorageProvider } from "@worm/shared/src/storage";

type StorageAuthKey = (typeof storageAuthSuffixes)[number];

/**
 * How long an item waits in the queue.
 */
const QUEUE_TIMEOUT_MS = 400;

/**
 * A queue to hold storage removal requests. Since various services listen to
 * storage changes, there was previously an issue when Amplify would first
 * remove certain keys before setting them when performing a token refresh. By
 * having these as two separate storage changes, it was difficult for some
 * services to determine the user's logged-in status during the brief interval
 * when no auth information is known. This queue was added to defer removing
 * certain keys for a short period to "flatten" the token refresh changes to a
 * single update.
 */
const removalQueue: Partial<
  Record<(typeof storageAuthSuffixes)[number], NodeJS.Timeout>
> = {};

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

export const sessionStorageProvider = getStorageProvider("local");

export const sessionStorageInterface = (
  clientId: string
): KeyValueStorageInterface => {
  const authKeyPrefix = `CognitoIdentityServiceProvider.${clientId}`;

  return {
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
          !key.startsWith(authKeyPrefix) ||
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
          !key.startsWith(authKeyPrefix) ||
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

        // cancel any pending removal updates
        const removalTimeout = removalQueue[suffix];
        if (removalTimeout) {
          clearTimeout(removalTimeout);
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
          !key.startsWith(authKeyPrefix) ||
          !storageAuthSuffixes.includes(suffix)
        ) {
          return resolve();
        }

        const removalTimeout = removalQueue[suffix];
        if (removalTimeout) {
          clearTimeout(removalTimeout);

          delete removalQueue[suffix];
        }

        const fn = async () => {
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
        };

        // defer storage update; add to queue
        removalQueue[suffix] = setTimeout(fn, QUEUE_TIMEOUT_MS);

        resolve();
      }),
  };
};
