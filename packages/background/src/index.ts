import { browser, storageGetByKeys, storageSetByKeys } from "@worm/shared";

browser.runtime.onInstalled.addListener(async () => {
  const { domainBlocklist, matchers, preferences } = await storageGetByKeys([
    "domainBlocklist",
    "matchers",
  ]);

  if (domainBlocklist === undefined) {
    await storageSetByKeys({
      domainBlocklist: ["docs.google.com"],
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
      },
    });
  }
});
