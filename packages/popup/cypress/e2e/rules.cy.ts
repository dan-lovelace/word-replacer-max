import { Storage } from "@worm/types";

const defaultStore: Partial<Storage> = {
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

describe("rules list", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/popup.html");
  });

  it("shows current rules", () => {
    cy.window().then((win) => {
      const browser = win.CYPRESS_BROWSER;

      browser.storage?.sync?.set(defaultStore).then(() => {
        browser.storage?.sync?.get().then((values) => {
          console.log("storage values", values);
        });
      });
    });
  });
});
