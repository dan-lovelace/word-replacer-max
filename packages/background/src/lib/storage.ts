import { v4 as uuidv4 } from "uuid";

import {
  BASELINE_STORAGE_VERSION,
  runStorageMigrations,
  storageGetByKeys,
  storageSetByKeys,
} from "@worm/shared/src/browser";
import { Matcher, Storage } from "@worm/types";

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

  const initialStorage: Storage = {};

  if (domainList === undefined) {
    initialStorage.domainList = ["docs.google.com", "github.com"];
  }

  if (exportLinks === undefined) {
    initialStorage.exportLinks = [];
  }

  if (matchers === undefined) {
    const defaultMatchers: Matcher[] = [
      {
        active: true,
        identifier: uuidv4(),
        queries: ["my jaw dropped", "I was shocked"],
        queryPatterns: [],
        replacement: "I was surprised",
        useGlobalReplacementStyle: true,
      },
      {
        active: true,
        identifier: uuidv4(),
        queries: ["This."],
        queryPatterns: ["case", "wholeWord"],
        replacement: " ",
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
