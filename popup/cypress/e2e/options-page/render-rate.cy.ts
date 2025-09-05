import { DEFAULT_RENDER_RATE_MS } from "@web-extension/shared/src/replace/lib/render";

import { selectors } from "../../support/selectors";

describe("options page render rate", () => {
  describe("functionality", () => {
    it("should initially render enabled when saved as ON", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          renderRate: {
            active: true,
            frequency: DEFAULT_RENDER_RATE_MS,
          },
        },
      });

      cy.appUserLogin();
      selectors.options.renderRate.toggleButton().should("be.checked");
    });

    it("should update storage when clicking the toggle button ON", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
        },
      });

      cy.appUserLogin();

      selectors.options.renderRate.toggleButton().click();

      cy.getBrowser().then(async (browser) => {
        const renderRate = (await browser.storage.sync?.get("renderRate"))
          ?.renderRate;

        cy.wrap(renderRate).should("have.property", "active", true);
      });
    });

    it("should update storage when clicking the toggle button OFF", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          renderRate: {
            active: true,
            frequency: DEFAULT_RENDER_RATE_MS,
          },
        },
      });

      cy.appUserLogin();

      selectors.options.renderRate.toggleButton().click();

      cy.getBrowser().then(async (browser) => {
        const renderRate = (await browser.storage.sync?.get("renderRate"))
          ?.renderRate;

        cy.wrap(renderRate).should("have.property", "active", false);
      });
    });
  });
});
