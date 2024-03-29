import { Storage, StorageKey } from "@worm/types";

import { browser } from "./browser";

const {
  storage: { sync },
} = browser;

export const storageGet = sync.get;
export const storageRemove = sync.remove;
export const storageSet = sync.set;

export async function storageGetByKeys<Key extends StorageKey>(keys?: Key[]) {
  const storage: Storage = await storageGet(keys);

  return storage;
}

export function storageRemoveByKeys<Key extends StorageKey>(keys: Key[]) {
  return storageRemove(keys);
}

export function storageSetByKeys(keys: Storage) {
  return storageSet(keys);
}
