import { merge } from "ts-deepmerge";

import { DEFAULT_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { Matcher, Storage, StorageVersion, storageVersions } from "@worm/types";

import { logDebug } from "../../logging";
import { STORAGE_MATCHER_PREFIX } from "../../matchers";

import { BASELINE_STORAGE_VERSION, CURRENT_STORAGE_VERSION } from "../";
import { storageGet, storageSet } from "../api";

export type MigrateFn = (storage: Storage) => Storage;

export type Migrations = {
  [major: number]: { [minor: number]: { [patch: number]: MigrateFn } };
};

export const MIGRATIONS: Migrations = {
  1: {
    0: {
      /**
       * **1.0.0** - Baseline
       *
       * Nothing to do here; initial values were previously set by the
       * background script.
       */
      0: (storage) => storage,
    },
    1: {
      /**
       * **1.1.0** - Replacement styles
       *
       * Introduces replacement styles for the first time. Creates a new
       * storage property and updates all existing matchers.
       */
      0: (storage) => {
        const updatedValues: Storage = {
          replacementStyle: DEFAULT_REPLACEMENT_STYLE,
        };
        const merged = merge(storage, updatedValues);

        for (const key of Object.keys(merged)) {
          if (key.startsWith(STORAGE_MATCHER_PREFIX)) {
            const matcher = merged[key as keyof typeof merged] as Matcher;

            matcher.useGlobalReplacementStyle = true;
          }
        }

        return merged;
      },
      /**
       * **1.1.1** - PLACEHOLDER
       *
       * This was put in place to assist with the migration system tests. It
       * may be replaced/removed by the next necessary migration.
       */
      1: (storage) => storage,
    },
  },
};

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
 * A hand-rolled database migration system for browser storage. The comments
 * here are overly-verbose on purpose.
 *
 * @remarks
 * Pay attention closely to any changes because this has the potential to mess
 * up real users' storage.
 */
export async function migrate(
  migrations: Migrations,
  targetVersion: StorageVersion = CURRENT_STORAGE_VERSION
) {
  /**
   * Get the latest version from storage.
   */
  let storageVersion = await fetchStorageVersion();

  if (!storageVersion) {
    /**
     * Storage does not contain a storage version at all. This must be a very
     * old installation so we need to start from scratch.
     */
    await storageSet({
      storageVersion: BASELINE_STORAGE_VERSION,
    });

    /**
     * Invoke the fetch API again to be sure it was correctly updated. This
     * serves to ensure read and write commands are working at this moment.
     */
    storageVersion = await fetchStorageVersion();
  }

  if (!storageVersion) {
    /**
     * Two attempts to obtain storage version have failed. Something strange is
     * going on; return early.
     */
    logDebug("Unable to get storage version");
    return;
  }

  /**
   * Make sure the current storage version is known.
   */
  if (!storageVersions.includes(storageVersion as StorageVersion)) {
    logDebug("Invalid storage version", storageVersion);
    return;
  }

  /**
   * Do not do anything if the current storage version matches the target.
   */
  if (storageVersion === targetVersion) {
    return;
  }

  /**
   * Keep track of which migration versions have been applied.
   */
  const migratedVersions: StorageVersion[] = [];

  for (const version of storageVersions) {
    /**
     * Do not run migrations that are newer than the target version.
     */
    if (isVersionGreaterThan(version, targetVersion)) continue;

    /**
     * Do not run migrations that are older than the current storage version.
     */
    if (!isVersionGreaterThan(version, storageVersion)) continue;

    /**
     * Look up the migration by version; exit early if it doesn't exist.
     */
    const [major, minor, patch] = version.split(".").map(Number);
    const migrateFn = migrations[major]?.[minor]?.[patch];
    if (!migrateFn) continue;

    /**
     * Get all storage to pass into the migrate function.
     */
    const currentStorage = await storageGet();

    /**
     * Execute the migration and increment the version.
     */
    logDebug("Migrating from", storageVersion, "to", version);
    const newStorage = migrateFn(currentStorage);
    newStorage.storageVersion = version;

    /**
     * Update the stored version to the latest.
     */
    await storageSet(newStorage);

    /**
     * Add the version to the execution list.
     */
    migratedVersions.push(version);

    /**
     * Be extra safe by again fetching the latest version from storage.
     */
    storageVersion = await fetchStorageVersion();
  }

  if (migratedVersions.length > 0) {
    logDebug(
      "Successfully applied",
      migratedVersions.length,
      `migration${migratedVersions.length === 1 ? "" : "s"}`
    );
  }

  return migratedVersions;
}
