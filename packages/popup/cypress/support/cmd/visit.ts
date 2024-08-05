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

function deepMerge<T extends object, U>(obj1: T, obj2: U): T & U {
  const result = { ...obj1 } as T & U;

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (isObject(obj2[key]) && key in obj1 && isObject((obj1 as any)[key])) {
        (result as any)[key] = deepMerge((obj1 as any)[key], obj2[key]);
      } else {
        (result as any)[key] = obj2[key];
      }
    }
  }

  return result;
}

function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}

Cypress.Commands.add(
  "visitWithStorage",
  (overrides?: VisitWithStorageParams) => {
    cy.visit(baseUrl).then(() => {
      cy.window().then((win) => {
        const browser = win.CYPRESS_BROWSER;
        const params = deepMerge(defaultStore, overrides);
        const syncSet = browser.storage?.sync?.set;

        assert(syncSet !== undefined, "Unable to find storage sync");

        syncSet?.(params ?? defaultStore).then(() => {
          s.homePage().should("be.visible");
        });
      });
    });
  }
);
