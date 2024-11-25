import { StorageVersion } from "@worm/types/src/storage";

import { CURRENT_STORAGE_VERSION } from "./";
import { migrate, MIGRATIONS } from "./database-migrations";

export async function runStorageMigrations(
  againstVersion: StorageVersion = CURRENT_STORAGE_VERSION
) {
  return migrate(MIGRATIONS, againstVersion);
}
