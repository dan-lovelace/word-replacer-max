import { STORAGE_MATCHER_PREFIX } from "@worm/shared/src/browser";
import { Matcher } from "@worm/types/src/rules";
import {
  Storage,
  StorageChange,
  StorageChangeOf,
  StorageProvider,
  SyncStorage,
} from "@worm/types/src/storage";

/**
 * Converts a stored set of storage data to a shape expected by the rest of the
 * application.
 * @param currentStorage The storage object as held in the extension's storage
 * system.
 * @param changes An object containing changed keys and their new & old values.
 * @param areaName Which storage area was updated.
 * @returns For `local` and `session` storage, the keys are retained as-is and
 * any necessary changes are made before returning the new object. For `sync`,
 * any updated keys that begin with `matcher__` have their values added to a
 * list of matchers to be returned as an array.
 */
export const getUpdatedStorage = (
  currentStorage: Storage,
  changes: Record<string, StorageChange>,
  areaName: StorageProvider
) => {
  if (!areaName || !["local", "session", "sync"].includes(areaName)) {
    return currentStorage;
  }

  const area = areaName as StorageProvider;
  const prevStorageArea = { ...currentStorage[area] };
  const updatedArea = { ...prevStorageArea };

  /**
   * A helper method for changing `updatedArea` based on a given key and
   * set of changes.
   */
  const commonUpdate = (key: string, change: StorageChange) => {
    if (change.newValue === undefined) {
      // Key is being removed
      delete (updatedArea as any)[key];
    } else {
      // Key is being updated
      (updatedArea as any)[key] = change.newValue;
    }
  };

  if (area === "sync") {
    const prevSyncStorage = updatedArea as SyncStorage;

    Object.entries(changes).forEach(([storedKey, change]) => {
      if (storedKey.startsWith(STORAGE_MATCHER_PREFIX)) {
        // Updating a matcher, modify the existing array of matchers
        const { newValue, oldValue } = change as StorageChangeOf<Matcher>;

        const newMatchers: Matcher[] = [...(prevSyncStorage.matchers || [])];

        if (newValue === undefined) {
          // Rule is being deleted
          const existingIdx =
            newMatchers.findIndex(
              (matcher) => matcher.identifier === oldValue?.identifier
            ) ?? -1;

          if (existingIdx < 0) {
            throw new Error("Unable to locate existing matcher during update");
          }

          newMatchers.splice(existingIdx, 1);
        } else if (oldValue === undefined) {
          // Rule is being added
          newMatchers.push(newValue);
        } else {
          // Rule is being updated
          const existingIdx =
            newMatchers.findIndex(
              (matcher) => matcher.identifier === oldValue?.identifier
            ) ?? -1;

          if (existingIdx < 0) {
            throw new Error("Unable to locate existing matcher during update");
          }

          newMatchers[existingIdx] = newValue;
        }

        (updatedArea as SyncStorage).matchers = newMatchers;
      } else {
        commonUpdate(storedKey, change);
      }
    });
  } else {
    // All other areas
    Object.entries(changes).forEach(([storedKey, change]) => {
      commonUpdate(storedKey, change);
    });
  }

  // Return new storage object with updated area
  return {
    ...currentStorage,
    [area]: updatedArea,
  };
};
