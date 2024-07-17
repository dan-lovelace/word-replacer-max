import { Matcher, Storage, StorageKey } from "@worm/types";

import { browser } from "./browser";
import {
  translateMatchersForStorage,
  translateStoredMatchers,
} from "./migrations";

const {
  storage: { sync },
} = browser;

export const storageGet = sync.get;
export const storageRemove = sync.remove;
export const storageSet = sync.set;

export async function storageGetByKeys<Key extends StorageKey>(keys?: Key[]) {
  // fetch all storage keys regardless of parameters; we'll filter the results
  const allStorage = await storageGet();
  let results: Storage = {};

  const queryKeys = [...(keys ?? [])];

  if (!queryKeys.length) {
    results = allStorage;
    results.matchers = translateStoredMatchers(allStorage);
  } else {
    for (const key of queryKeys) {
      switch (key) {
        case "matchers":
          results.matchers = translateStoredMatchers(allStorage);
          break;

        default:
          results[key] = allStorage[key];
      }
    }
  }

  return results;
}

export function storageRemoveByKeys<Key extends StorageKey>(keys: Key[]) {
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
    storageMatchers = translateMatchersForStorage(keys.matchers);

    delete keys.matchers;
  }

  return storageSet({
    ...keys,
    ...storageMatchers,
  });
}
