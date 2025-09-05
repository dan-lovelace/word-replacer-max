import { DEFAULT_RENDER_RATE } from "@web-extension/shared/src/replace/lib/render";
import { DEFAULT_RULE_SYNC } from "@web-extension/shared/src/replace/lib/rule-sync";
import { DEFAULT_REPLACEMENT_STYLE } from "@web-extension/shared/src/replace/lib/style";
import { Storage } from "@wordreplacermax/types/src/storage";

import MockBrowser from "./mock-webextension-polyfill";

declare global {
  interface Window {
    TEST_BROWSER: MockBrowser<Storage>;
  }
}

const mockSyncStorage: Record<string, any> = {
  domainList: ["docs.google.com", "github.com"],
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
    focusRule: {
      field: "replacement",
      matcher: "",
    },
  },
  renderRate: DEFAULT_RENDER_RATE,
  replacementStyle: DEFAULT_REPLACEMENT_STYLE,
  ruleSync: DEFAULT_RULE_SYNC,
};

const browser = new MockBrowser({
  withStorage: {
    sync: mockSyncStorage,
  },
});

window.TEST_BROWSER = browser;

export { browser as default };
