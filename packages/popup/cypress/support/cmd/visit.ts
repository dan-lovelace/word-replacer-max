import { merge } from "ts-deepmerge";

import { STORAGE_MATCHER_PREFIX } from "@worm/shared/src/browser/matchers";
import { POPUP_DEV_SERVER_PORT } from "@worm/testing/src/popup";

import { generateMatchers } from "../generators/rules";
import { selectors as s } from "../selectors";
import { VisitWithStorageParams } from "../types";

const baseUrl = `http://localhost:${POPUP_DEV_SERVER_PORT}/popup.html`;

const defaultStore: VisitWithStorageParams = {
  local: {},
  session: {},
  sync: {
    domainList: ["docs.google.com", "github.com"],
    preferences: {
      activeTab: "rules",
      domainListEffect: "deny",
      extensionEnabled: true,
      focusRule: {
        field: "replacement",
        matcher: "",
      },
    },
    ...generateMatchers(),
  },
};

Cypress.Commands.add(
  "visitWithStorage",
  (overrides: VisitWithStorageParams = {}) => {
    cy.visit(baseUrl).then(() => {
      cy.window().then(async ($window) => {
        s.homePage().should("be.visible");

        const browser = $window.TEST_BROWSER;
        const storageSync = browser.storage.sync;

        expect(storageSync).to.not.eq(undefined);

        const store = merge(defaultStore, overrides);

        /**
         * Check to see if `sync` overrides have been provided. If so, we need
         * to clean up any existing test browser matchers to allow overriding
         * them.
         */
        if (Object.prototype.hasOwnProperty.call(overrides, "sync")) {
          const syncStorage: Record<string, any> | undefined =
            await storageSync?.get();

          const keysToDelete = syncStorage
            ? Object.keys(syncStorage).filter((key) =>
                key.startsWith(STORAGE_MATCHER_PREFIX)
              )
            : [];

          await storageSync?.remove(keysToDelete);
        }

        await browser.storage.local?.set(store.local);
        await browser.storage.session?.set(store.session);
        await storageSync?.set(store.sync);
      });
    });
  }
);
