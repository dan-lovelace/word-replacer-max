import { v4 as uuidv4 } from "uuid";

import {
  CURRENT_STORAGE_VERSION,
  storageGetByKeys,
  storageSetByKeys,
} from "@worm/shared";
import { Matcher } from "@worm/types";

export async function initializeStorage() {
  const { storageVersion } = await storageGetByKeys(["storageVersion"]);

  if (storageVersion === undefined) {
    await storageSetByKeys({
      storageVersion: CURRENT_STORAGE_VERSION,
    });
  } else if (storageVersion !== CURRENT_STORAGE_VERSION) {
    // perform any necessary migrations before proceeding
  }

  const { domainList, matchers, preferences } = await storageGetByKeys([
    "domainList",
    "matchers",
    "preferences",
  ]);

  if (domainList === undefined) {
    await storageSetByKeys({
      domainList: ["docs.google.com", "github.com"],
    });
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

    await storageSetByKeys({ matchers: defaultMatchers });
  }

  if (preferences === undefined) {
    await storageSetByKeys({
      preferences: {
        activeTab: "rules",
        domainListEffect: "deny",
        exportLink: {
          updatedAt: new Date().toLocaleDateString(),
          url: "",
        },
        extensionEnabled: true,
        focusRule: "",
      },
    });
  }
}
