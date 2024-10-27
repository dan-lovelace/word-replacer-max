import { DEFAULT_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { Storage } from "@worm/types";

import MockBrowser from "./mock-webextension-polyfill";

declare global {
  interface Window {
    TEST_BROWSER: MockBrowser<Storage>;
  }
}

const mockSyncStorage: Record<string, any> = {
  domainList: [],
  matcher__1234: {
    active: true,
    identifier: "1234",
    queries: ["my jaw dropped", "I was shocked"],
    queryPatterns: [],
    replacement: "I was surprised",
  },
  matcher__5678: {
    active: true,
    identifier: "5678",
    queries: ["This."],
    queryPatterns: ["case", "wholeWord"],
    replacement: " ",
  },
  preferences: {
    activeTab: "rules",
    domainListEffect: "deny",
    extensionEnabled: true,
    focusRule: "",
  },
  replacementStyle: DEFAULT_REPLACEMENT_STYLE,
};

const browser = new MockBrowser({
  withStorage: {
    sync: mockSyncStorage,
  },
});

window.TEST_BROWSER = browser;

export { browser as default };
