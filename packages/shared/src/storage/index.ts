import { StorageVersion } from "@worm/types/src/storage";

/**
 * The storage version from which all others are based. This should be the
 * starting point for migrations and used only when no version exists yet.
 */
export const BASELINE_STORAGE_VERSION: StorageVersion = "1.0.0";

/**
 * The storage version currently in use.
 */
export const CURRENT_STORAGE_VERSION: StorageVersion = "1.1.1";

export * from "./api";
export * from "./migrations";
