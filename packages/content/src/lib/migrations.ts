import { merge } from "ts-deepmerge";

import {
  BASELINE_STORAGE_VERSION,
  CURRENT_STORAGE_VERSION,
  logDebug,
  STORAGE_MATCHER_PREFIX,
  storageGet,
  storageSet,
} from "@worm/shared";
import { DEFAULT_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { Matcher, Storage, StorageVersion, storageVersions } from "@worm/types";

type MigrateFn = (storage: Storage) => Storage;

async function fetchStorageVersion() {
  const { storageVersion } = await storageGet(["storageVersion"]);

  return storageVersion;
}

function isVersionGreaterThan(a: StorageVersion, b: StorageVersion): boolean {
  const [aMajor, aMinor, aPatch] = a.split(".").map(Number);
  const [bMajor, bMinor, bPatch] = b.split(".").map(Number);

  if (aMajor > bMajor) return true;
  if (aMajor < bMajor) return false;
  if (aMinor > bMinor) return true;
  if (aMinor < bMinor) return false;

  return aPatch > bPatch;
}

/**
 * Contains the transformation methods necessary to increment a single version.
 * If the current storage version is `1.0.0`, run `migrations[1][0][0] to apply
 * the next version.
 */
const migrations: {
  [major: number]: { [minor: number]: { [patch: number]: MigrateFn } };
} = {
  0: {
    0: {
      0: (storage) => {
        const updatedValues: Storage = {
          storageVersion: "1.0.0",
        };
        const merged = merge(storage, updatedValues);

        return merged;
      },
    },
  },
  1: {
    0: {
      0: (storage) => {
        const updatedValues: Storage = {
          replacementStyle: DEFAULT_REPLACEMENT_STYLE,
          storageVersion: "1.1.0",
        };
        const merged = merge(storage, updatedValues);

        /**
         * Add new properties to all stored matchers.
         */
        for (const key of Object.keys(merged)) {
          if (key.startsWith(STORAGE_MATCHER_PREFIX)) {
            const matcher = merged[key as keyof typeof merged] as Matcher;

            matcher.useGlobalReplacementStyle = true;
          }
        }

        return merged;
      },
    },
  },
};

/**
 * A hand-rolled database migration system for browser storage.
 */
export async function runStorageMigrations(
  againstVersion: StorageVersion = CURRENT_STORAGE_VERSION
) {
  let storageVersion = await fetchStorageVersion();

  if (!storageVersion) {
    /**
     * Storage does not contain a storage version at all. This must be a very
     * old installation so we need to start from scratch.
     */
    await storageSet({
      storageVersion: BASELINE_STORAGE_VERSION,
    });

    storageVersion = await fetchStorageVersion();
  }

  if (!storageVersion) {
    logDebug("Unable to obtain storage version");
    return;
  }

  if (!storageVersions.includes(storageVersion as StorageVersion)) {
    logDebug("Invalid storage version", storageVersion);
    return;
  }

  if (storageVersion === againstVersion) {
    /**
     * No migrations necessary.
     */
    return;
  }

  let migrationCount = 0;

  for (const version of storageVersions) {
    if (!storageVersion) continue;
    if (!isVersionGreaterThan(againstVersion, version)) continue;

    const [major, minor, patch] = version.split(".").map(Number);
    const migrateFn = migrations[major]?.[minor]?.[patch];

    if (!migrateFn) {
      continue;
    }

    const currentStorage = await storageGet();

    logDebug("Running migration", version);
    const newStorage = migrateFn(currentStorage);

    await storageSet(newStorage);

    migrationCount += 1;
    storageVersion = await fetchStorageVersion();
  }

  if (migrationCount > 0) {
    logDebug("Successfully applied", migrationCount, "migration(s)");
  }
}
