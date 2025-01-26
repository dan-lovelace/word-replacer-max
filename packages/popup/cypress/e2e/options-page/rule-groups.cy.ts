import { selectors } from "../../support/selectors";

describe("rule groups", () => {
  describe("feature availability", () => {
    beforeEach(() => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
        },
      });
    });

    it("should not display when logged out", () => {
      selectors.options.ruleGroups.inputWrapper().should("not.exist");
    });

    it("should display when logged in", () => {
      cy.appUserLogin();

      selectors.options.ruleGroups.inputWrapper().should("be.visible");
      selectors.options.ruleGroups.toggleButton().should("not.be.checked");
    });
  });

  describe("functionality", () => {
    it("should initially render enabled when saved as ON", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          ruleGroups: {
            active: true,
          },
        },
      });

      cy.appUserLogin();
      selectors.options.ruleGroups.toggleButton().should("be.checked");
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

      selectors.options.ruleGroups.toggleButton().click();

      cy.getBrowser().then(async (browser) => {
        const ruleGroups = (await browser.storage.sync?.get("ruleGroups"))
          ?.ruleGroups;

        cy.wrap(ruleGroups).should("have.property", "active", true);
      });
    });

    it("should update storage when clicking the toggle button OFF", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          ruleGroups: {
            active: true,
          },
        },
      });

      cy.appUserLogin();

      selectors.options.ruleGroups.toggleButton().click();

      cy.getBrowser().then(async (browser) => {
        const ruleGroups = (await browser.storage.sync?.get("ruleGroups"))
          ?.ruleGroups;

        cy.wrap(ruleGroups).should("have.property", "active", false);
      });
    });
  });
});
