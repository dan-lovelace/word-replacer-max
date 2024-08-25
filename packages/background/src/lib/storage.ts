import { v4 as uuidv4 } from "uuid";

import {
  CURRENT_STORAGE_VERSION,
  storageGetByKeys,
  storageSetByKeys,
} from "@worm/shared/src/browser";
import { Matcher, Storage } from "@worm/types";

export async function initializeStorage() {
  const { storageVersion } = await storageGetByKeys(["storageVersion"]);

  if (storageVersion === undefined) {
    await storageSetByKeys({
      storageVersion: CURRENT_STORAGE_VERSION,
    });
  } else if (storageVersion !== CURRENT_STORAGE_VERSION) {
    // perform any necessary migrations before proceeding
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
      },
      {
        active: true,
        identifier: uuidv4(),
        queries: ["This."],
        queryPatterns: ["case", "wholeWord"],
        replacement: " ",
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
}
