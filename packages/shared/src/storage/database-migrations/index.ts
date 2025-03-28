import { merge } from "ts-deepmerge";

import {
  DEFAULT_REPLACEMENT_STYLE,
  DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
} from "@worm/shared/src/replace/lib/style";
import { Matcher } from "@worm/types/src/rules";
import {
  StorageVersion,
  storageVersions,
  SyncStorage,
} from "@worm/types/src/storage";

import { STORAGE_MATCHER_PREFIX } from "../../browser";
import { logDebug } from "../../logging";
import { DEFAULT_RULE_GROUPS } from "../../replace/lib/groups";
import { DEFAULT_RULE_SYNC } from "../../replace/lib/rule-sync";
import { DEFAULT_REPLACEMENT_SUGGEST } from "../../replace/lib/suggest";

import { BASELINE_STORAGE_VERSION, CURRENT_STORAGE_VERSION } from "../";
import { storageGet, storageSet } from "../api";

type ParseVersion<T extends string> =
  T extends `${infer Major}.${infer Minor}.${infer Patch}`
    ? [Major, Minor, Patch]
    : never;

type ValidVersionTuples = {
  [K in StorageVersion]: ParseVersion<K>;
}[StorageVersion];

// Create separate types for valid major, minor, and patch numbers
type ValidMajor = ValidVersionTuples[0];
type ValidMinorsByMajor = {
  [K in ValidVersionTuples as K[0]]: K[1];
};
type ValidPatchesByMinor = {
  [K in ValidVersionTuples as `${K[0]}.${K[1]}`]: K[2];
};

type StrictMigrations = {
  [Major in ValidMajor]: {
    [Minor in ValidMinorsByMajor[Major]]: {
      [Patch in ValidPatchesByMinor[`${Major}.${Minor}`]]: MigrateFn;
    };
  };
};

export type MigrateFn = (storage: SyncStorage) => SyncStorage;

export type Migrations = {
  [major: number]: { [minor: number]: { [patch: number]: MigrateFn } };
};

export const MIGRATIONS: StrictMigrations = {
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
        const updatedValues: SyncStorage = {
          replacementStyle: DEFAULT_REPLACEMENT_STYLE,
        };
        const merged = merge(storage, updatedValues);

        for (const key of Object.keys(merged)) {
          if (key.startsWith(STORAGE_MATCHER_PREFIX)) {
            const matcher = merged[key as keyof typeof merged] as Matcher;

            matcher.useGlobalReplacementStyle =
              DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE;
          }
        }

        return merged;
      },
      /**
       * **1.1.1** - Replacement suggestions
       *
       * Initializes replacement suggestions by creating a new storage
       * property with default values.
       */
      1: (storage) => {
        const updatedValues: SyncStorage = {
          replacementSuggest: DEFAULT_REPLACEMENT_SUGGEST,
        };
        const merged = merge(storage, updatedValues);

        return merged;
      },
    },
    2: {
      /**
       * **1.2.0** - Rule groups
       *
       * Initializes rule groups with default values. Also reshapes focus rule
       * preferences from a string to an object.
       */
      0: (storage) => {
        const updatedValues: SyncStorage = {
          ruleGroups: DEFAULT_RULE_GROUPS,
        };
        const merged = merge(storage, updatedValues);

        if (merged.preferences) {
          merged.preferences.focusRule = {
            field: "replacement",
            matcher: "",
          };
        }

        return merged;
      },
    },
    3: {
      /**
       * **1.3.0** - Unlimited rules storage
       *
       * Adds the property that tracks the user's chosen rule storage provider
       * if it does not exist.
       */
      0: (storage) => {
        let updatedValues: SyncStorage = {};

        if (storage.ruleSync === undefined) {
          updatedValues = {
            ruleSync: DEFAULT_RULE_SYNC,
          };
        }

        const merged = merge(storage, updatedValues);

        return merged;
      },
    },
  },
};

async function fetchStorageVersion() {
  const { storageVersion } = await storageGet(["storageVersion"]);

  if (!storageVersion) {
    return undefined;
  }

  return storageVersion as StorageVersion;
}

function isVersionGreaterThan(
  a: StorageVersion,
  b: StorageVersion | undefined
): boolean {
  const [aMajor, aMinor, aPatch] = a.split(".").map(Number);
  const [bMajor, bMinor, bPatch] = b ? b.split(".").map(Number) : [];

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
 * up real users' storage. Write new tests for any changes and DO NOT update
 * old migration snapshots.
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
