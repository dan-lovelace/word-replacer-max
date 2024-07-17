import { Matcher, Storage, StorageKey } from "@worm/types";

import { browser } from "./browser";
import { matchersFromStorage, matchersToStorage } from "./matchers";

const {
  storage: { sync },
} = browser;

export const storageGet = sync.get;
export const storageRemove = sync.remove;
export const storageSet = sync.set;

export async function storageGetByKeys<Key extends StorageKey>(keys?: Key[]) {
  // fetch all storage keys regardless of parameters; we'll filter the results
  const allStorage = await storageGet();
  const queryKeys = [...(keys ?? [])];

  let results: Storage = {};

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

export function storageRemoveByKeys<Key extends StorageKey | string>(
  keys: Key[]
) {
  return storageRemove(keys);
}

export function storageSetByKeys(keys: Storage) {
  let storageMatchers: Record<string, Matcher> = {};

  if (Object.prototype.hasOwnProperty.call(keys, "matchers")) {
    /**
     * NOTE: Matchers are being set. We need to save them to storage in a flat
     * structure to allow users to save the maximum amount of data using the
     * `sync` method.
     *
     * See: https://github.com/dan-lovelace/word-replacer-max/issues/4
     */
    storageMatchers = matchersToStorage(keys.matchers);
    delete keys.matchers;
  }

  return storageSet({
    ...keys,
    ...storageMatchers,
  });
}
