import { merge } from "ts-deepmerge";

import { selectors as s } from "../selectors";
import { VisitWithStorageParams } from "../types";

const baseUrl = "http://localhost:5173/popup.html";

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

Cypress.Commands.add(
  "visitWithStorage",
  (overrides?: VisitWithStorageParams) => {
    cy.visit(baseUrl).then(() => {
      cy.window().then(($window) => {
        s.homePage().should("be.visible");

        const browser = $window.DEV_BROWSER;
        const params = merge.withOptions(
          { mergeArrays: false },
          defaultStore,
          overrides ?? {}
        );

        const syncSet = browser.storage?.sync?.set;
        assert(syncSet !== undefined, "Unable to find storage sync");
        syncSet?.(params);
      });
    });
  }
);
