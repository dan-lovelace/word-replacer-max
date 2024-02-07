import { browser, storageGetByKeys, storageSetByKeys } from "@worm/shared";

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
    await storageSetByKeys({
      matchers: [
        {
          active: true,
          identifier: new Date().getTime().toString(),
          queries: ["google"],
          queryPatterns: [],
          replacement: "doogle",
        },
      ],
    });
  }

  if (preferences === undefined) {
    await storageSetByKeys({
      preferences: {
        activeTab: "rules",
        domainListEffect: "deny",
      },
    });
  }
});
