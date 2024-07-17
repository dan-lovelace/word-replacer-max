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
        identifier: "b7fce47e-58e8-4409-adf4-08da053e713d",
        queries: ["my jaw dropped", "I was shocked"],
        queryPatterns: [],
        replacement: "I was surprised",
      },
      {
        active: true,
        identifier: "34eb8c78-402e-4006-b5a9-b1b15af7a037",
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
