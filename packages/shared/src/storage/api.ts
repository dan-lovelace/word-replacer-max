import { Matcher } from "@worm/types/src/rules";
import {
  LocalStorage,
  StorageProvider,
  StorageSetOptions,
  SyncStorage,
  SyncStorageKey,
} from "@worm/types/src/storage";

import {
  browser,
  getMatcherGroups,
  matchersFromStorage,
  matchersToStorage,
  STORAGE_MATCHER_PREFIX,
} from "../browser";
import { logDebug } from "../logging";

const {
  storage: { sync },
} = browser;

const localStorageProvider = getStorageProvider("local");

export const storageClear = sync.clear;
export const storageGet = sync.get;
export const storageRemove = sync.remove;
export const storageSet = sync.set;

export const authStorageProvider = getStorageProvider("local");

export function getStorageProvider(providerName: StorageProvider = "sync") {
  return browser.storage[providerName];
}

export async function storageGetByKeys<T extends SyncStorageKey>(keys?: T[]) {
  // fetch all storage keys regardless of parameters; we'll filter the results
  const allStorage = (await storageGet()) as SyncStorage;
  const queryKeys = [...(keys ?? [])];

  let results: SyncStorage = {};

  if (!queryKeys.length) {
    results = allStorage;
    results.matchers = matchersFromStorage(allStorage);
  } else {
    for (const key of queryKeys) {
      switch (key) {
        case "matchers":
          results.matchers = matchersFromStorage(allStorage);
          break;

        default:
          results[key] = allStorage[key];
      }
    }
  }

  return results;
}

export async function storageRemoveByKeys<Key extends SyncStorageKey | string>(
  keys: Key[]
) {
  const matcherKeys = keys.filter((key) =>
    key.startsWith(`${STORAGE_MATCHER_PREFIX}`)
  ) as (keyof SyncStorage)[];

  if (matcherKeys.length > 0) {
    /**
     * A matcher is being deleted. Clean up any associated rule group
     * matchers.
     */
    const allStorage = await storageGetByKeys();
    const groups = getMatcherGroups(allStorage) ?? {};

    for (const matcherKey of matcherKeys) {
      const matcher = allStorage.matchers?.find(
        (matcher) =>
          `${STORAGE_MATCHER_PREFIX}${matcher.identifier}` === matcherKey
      );

      for (const group of Object.values(groups)) {
        group.matchers = group.matchers?.filter(
          (matcherId) => matcherId !== matcher?.identifier
        );
      }
    }

    await storageSetByKeys(groups);
  }

  return storageRemove(keys);
}

export async function storageSetByKeys(
  keys: SyncStorage,
  options?: StorageSetOptions
) {
  let storageMatchers: Record<string, Matcher> = {};

  if (Object.prototype.hasOwnProperty.call(keys, "matchers")) {
    const { matchers } = keys;

    if (!matchers || matchers.length < 1) {
      /**
       * Matchers are being deleted. Look up all existing matchers in the flat
       * storage structure and remove them.
       */
      const allStorage = await storageGet();
      const storedMatchers = matchersFromStorage(allStorage);

      if (storedMatchers) {
        await storageRemoveByKeys(
          storedMatchers.map(
            (matcher) => `${STORAGE_MATCHER_PREFIX}${matcher.identifier}`
          )
        );
      }

      /**
       * Clean up any associated rule group matchers.
       */
      const storedMatcherGroups = getMatcherGroups(allStorage) ?? {};
      const groupsArray = Object.values(storedMatcherGroups ?? {});

      for (const group of groupsArray) {
        group.matchers = [];
      }

      await storageSetByKeys(storedMatcherGroups);
    }

    /**
     * Matchers are being updated. We need to save them to storage in a flat
     * structure to allow users to save the maximum amount of data using the
     * `sync` storage area.
     *
     * See: https://github.com/dan-lovelace/word-replacer-max/issues/4
     */
    storageMatchers = matchersToStorage(matchers);

    /**
     * Clean up orphaned matchers from `local` storage.
     */
    const matchersSet = new Set(matchers?.map((matcher) => matcher.identifier));
    const { recentSuggestions } =
      (await localStorageProvider.get()) as LocalStorage;

    if (recentSuggestions) {
      Object.keys(recentSuggestions).forEach((key) => {
        if (!matchersSet.has(key)) {
          delete recentSuggestions[key];
        }
      });

      await localStorageProvider.set({
        recentSuggestions,
      });
    }

    delete keys.matchers;
  }

  try {
    await storageSet({
      ...keys,
      ...storageMatchers,
    });

    if (typeof options?.onSuccess === "function") {
      options.onSuccess();
    }
  } catch (error: unknown) {
    logDebug("Something went wrong updating storage", error);

    if (error instanceof Error && typeof options?.onError === "function") {
      let { message } = error;

      switch (message) {
        case "QUOTA_BYTES quota exceeded": // chrome
        case "QuotaExceededError: storage.sync API call exceeded its quota limitations.": // firefox
          message =
            "Action could not be completed as it exceeds your storage capacity.";
          break;
      }

      options.onError(message);
    }
  }
}
