import {
  Storage,
  StorageChange,
  StorageProvider,
} from "@wordreplacermax/types/src/storage";

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

  Object.entries(changes).forEach(([storedKey, change]) => {
    commonUpdate(storedKey, change);
  });

  return {
    ...currentStorage,
    [area]: updatedArea,
  };
};
