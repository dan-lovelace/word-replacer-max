import { Storage } from "@worm/types";

import MockBrowser from "./mock-webextension-polyfill";

declare global {
  interface Window {
    TEST_BROWSER: MockBrowser<Storage>;
  }
}

const storage: Storage = {
  domainList: [],
  matchers: [
    {
      active: true,
      identifier: "1234",
      queries: ["my jaw dropped", "I was shocked"],
      queryPatterns: [],
      replacement: "I was surprised",
    },
    {
      active: true,
      identifier: "5678",
      queries: ["This."],
      queryPatterns: ["case", "wholeWord"],
      replacement: " ",
    },
  ],
  preferences: {
    activeTab: "rules",
    domainListEffect: "deny",
    extensionEnabled: true,
    focusRule: "",
  },
};

const browser = new MockBrowser({
  withStorage: storage,
});

window.TEST_BROWSER = browser;

export { browser as default };
