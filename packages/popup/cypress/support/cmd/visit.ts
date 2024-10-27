import { STORAGE_MATCHER_PREFIX } from "@worm/shared/src/browser/matchers";

import { selectors as s } from "../selectors";
import { VisitWithStorageParams } from "../types";

const baseUrl = "http://localhost:5173/popup.html";

const defaultStore: VisitWithStorageParams = {
  sync: {
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
  },
};

Cypress.Commands.add(
  "visitWithStorage",
  (overrides: VisitWithStorageParams = {}) => {
    cy.visit(baseUrl).then(() => {
      cy.window().then(async ($window) => {
        s.homePage().should("be.visible");

        const browser = $window.TEST_BROWSER;
        const syncSet = browser.storage?.sync?.set;

        expect(syncSet).to.not.eq(undefined);

        const params = { ...defaultStore };

        (Object.keys(overrides) as (keyof VisitWithStorageParams)[]).forEach(
          (key) => {
            params[key as keyof typeof params] = overrides[key];
          }
        );

        /**
         * Check to see if `sync` overrides have been provided. If so, we need
         * to clean up any existing test browser matchers to allow overriding
         * them.
         */
        if (Object.prototype.hasOwnProperty.call(overrides, "sync")) {
          const syncStorage: Record<string, any> | undefined =
            await browser.storage.sync?.get();

          const keysToDelete = syncStorage
            ? Object.keys(syncStorage).filter((key) =>
                key.startsWith(STORAGE_MATCHER_PREFIX)
              )
            : [];

          await browser.storage.sync?.remove(keysToDelete);
        }

        await syncSet?.(params.sync);
      });
    });
  }
);
