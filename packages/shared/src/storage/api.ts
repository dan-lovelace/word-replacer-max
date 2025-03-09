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
  STORAGE_MATCHER_PREFIX,
} from "../browser";
import { logDebug } from "../logging";

const {
  storage: { sync },
} = browser;

export const authStorageProvider = getStorageProvider("local");
export const localStorageProvider = getStorageProvider("local");
export const syncStorageProvider = getStorageProvider("sync");

export const storageClear = sync.clear;
export const storageGet = sync.get;
export const storageRemove = sync.remove;
export const storageSet = sync.set;

export function getStorageProvider(providerName: StorageProvider = "sync") {
  return browser.storage[providerName];
}

export async function storageGetByKeys<Key extends SyncStorageKey>(
  keys?: Key[],
  options?: StorageSetOptions
) {
  const storageProvider = getStorageProvider(options?.provider ?? "sync");
  const storageResponse = (await storageProvider.get(keys)) as SyncStorage;

  return storageResponse;
}

export async function storageRemoveByKeys<Key extends SyncStorageKey | string>(
  keys: Key[],
  options?: StorageSetOptions
) {
  const storageProvider = getStorageProvider(options?.provider ?? "sync");
  const matcherKeys = keys.filter((key) =>
    key.startsWith(STORAGE_MATCHER_PREFIX)
  ) as (keyof SyncStorage)[];

  if (matcherKeys.length > 0) {
    /**
     * At least one matcher is being deleted. Clean up any associated rule
     * group matchers and recent suggestions before removing matcher keys from
     * the appropriate storage.
     */
    const syncStorage = (await storageGetByKeys()) as SyncStorage;
    const localStorage = (await localStorageProvider.get()) as LocalStorage;

    const isSyncActive = Boolean(syncStorage.ruleSync?.active);
    const matcherStorage = isSyncActive ? syncStorage : localStorage;
    const groups = getMatcherGroups(matcherStorage) ?? {};
    const allMatchers = matchersFromStorage(matcherStorage);

    // update any related rule group items
    for (const matcherKey of matcherKeys) {
      const matcher = allMatchers?.find(
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

    // update any related recent suggestions
    const matchersSet = new Set<string>(
      allMatchers?.map((matcher) => matcher.identifier)
    );
    const { recentSuggestions } = localStorage;

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

    // now perform the remove operation
    const matcherStorageProvider = getStorageProvider(
      isSyncActive ? "sync" : "local"
    );

    await matcherStorageProvider.remove(matcherKeys);
  }

  return storageProvider.remove(keys);
}

export async function storageSetByKeys(
  keys: SyncStorage,
  options?: StorageSetOptions
) {
  const storageProvider = getStorageProvider(options?.provider ?? "sync");

  await storageProvider
    .set(keys)
    .then(() => {
      if (typeof options?.onSuccess === "function") {
        options.onSuccess();
      }
    })
    .catch((error: unknown) => {
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
    });
}
