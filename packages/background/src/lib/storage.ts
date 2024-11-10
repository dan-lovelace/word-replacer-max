import { v4 as uuidv4 } from "uuid";

import {
  BASELINE_STORAGE_VERSION,
  runStorageMigrations,
  storageGetByKeys,
  storageSetByKeys,
} from "@worm/shared/src/storage";
import { Matcher } from "@worm/types/src/rules";
import { SyncStorage } from "@worm/types/src/storage";

export async function initializeStorage() {
  const { storageVersion } = await storageGetByKeys(["storageVersion"]);

  if (storageVersion === undefined) {
    await storageSetByKeys({
      storageVersion: BASELINE_STORAGE_VERSION,
    });
  }

  const { domainList, exportLinks, matchers, preferences } =
    await storageGetByKeys([
      "domainList",
      "exportLinks",
      "matchers",
      "preferences",
    ]);

  const initialStorage: SyncStorage = {};

  if (domainList === undefined) {
    initialStorage.domainList = [];
  }

  if (exportLinks === undefined) {
    initialStorage.exportLinks = [];
  }

  if (matchers === undefined) {
    const defaultMatchers: Matcher[] = [
      {
        active: true,
        identifier: uuidv4(),
        queries: ["awesome", "amazing", "insane"],
        queryPatterns: [],
        replacement: "wonderful",
        useGlobalReplacementStyle: true,
      },
      {
        active: true,
        identifier: uuidv4(),
        queries: ["color"],
        queryPatterns: ["wholeWord"],
        replacement: "colour",
        useGlobalReplacementStyle: true,
      },
    ];

    initialStorage.matchers = defaultMatchers;
  }

  if (preferences === undefined) {
    initialStorage.preferences = {
      activeTab: "rules",
      domainListEffect: "deny",
      extensionEnabled: true,
      focusRule: "",
    };
  }

  await storageSetByKeys(initialStorage);
  await runStorageMigrations();
}
