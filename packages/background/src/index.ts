import { v4 as uuidv4 } from "uuid";

import { browser, storageGetByKeys, storageSetByKeys } from "@worm/shared";
import { Matcher } from "@worm/types";

browser.runtime.onInstalled.addListener(async () => {
  const { domainList, matchers, preferences } = await storageGetByKeys([
    "domainList",
    "matchers",
    "preferences",
  ]);

  if (domainList === undefined) {
    await storageSetByKeys({
      domainList: ["docs.google.com"],
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
        replacement: "",
      },
    ];

    await storageSetByKeys({ matchers: defaultMatchers });
  }

  if (preferences === undefined) {
    await storageSetByKeys({
      preferences: {
        activeTab: "rules",
        domainListEffect: "deny",
        extensionEnabled: true,
      },
    });
  }
});
