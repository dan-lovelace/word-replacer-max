import {
  generateMatcherGroups,
  TEST_GROUP_ID_1,
  TEST_MATCHER_ID_1,
  testRules,
} from "../../support/generators/rules";
import { selectors } from "../../support/selectors";

const testMatcherGroups = generateMatcherGroups({
  [TEST_GROUP_ID_1]: {
    active: false,
    identifier: "1234",
    color: "red",
    name: "Override Group 1",
    matchers: [testRules[TEST_MATCHER_ID_1].identifier],
  },
});

describe("home page rule groups", () => {
  describe("toolbar", () => {
    it("should not display when logged out and feature is disabled", () => {
      cy.visitWithStorage({
        sync: {
          ...testMatcherGroups,
        },
      });

      selectors.ruleGroups.toolbar.root().should("not.exist");
    });

    it("should not display when logged out and feature is enabled", () => {
      cy.visitWithStorage({
        sync: {
          ...testMatcherGroups,
          ruleGroups: {
            active: true,
          },
        },
      });

      selectors.ruleGroups.toolbar.root().should("not.exist");
    });

    it("should not display when logged in and feature is disabled", () => {
      cy.visitWithStorage({
        sync: {
          ...testMatcherGroups,
          ruleGroups: {
            active: false,
          },
        },
      });
      cy.appUserLogin();

      selectors.ruleGroups.toolbar.root().should("not.exist");
    });

    it("should display when logged in and feature is enabled", () => {
      cy.visitWithStorage({
        sync: {
          ...testMatcherGroups,
          ruleGroups: {
            active: true,
          },
        },
      });
      cy.appUserLogin();

      selectors.ruleGroups.toolbar.root().should("be.visible");
    });
  });

  describe("rules row", () => {
    it("should not display included groups when logged out and feature is disabled", () => {
      cy.visitWithStorage({
        sync: {
          ...testMatcherGroups,
          ruleGroups: {
            active: false,
          },
        },
      });

      selectors.rules.ruleGroups.includedGroupsList().should("not.exist");
    });

    it("should not display included groups when logged out and feature is enabled", () => {
      cy.visitWithStorage({
        sync: {
          ...testMatcherGroups,
          ruleGroups: {
            active: true,
          },
        },
      });

      selectors.rules.ruleGroups.includedGroupsList().should("not.exist");
    });

    it("should not display included groups when logged in and feature is disabled", () => {
      cy.visitWithStorage({
        sync: {
          ...testMatcherGroups,
          ruleGroups: {
            active: false,
          },
        },
      });
      cy.appUserLogin();

      selectors.rules.ruleGroups.includedGroupsList().should("not.exist");
    });

    it("should display included groups when logged in and feature is enabled", () => {
      cy.visitWithStorage({
        sync: {
          ...testMatcherGroups,
          ruleGroups: {
            active: true,
          },
        },
      });
      cy.appUserLogin();

      selectors.ruleRowsFirst().within(() => {
        selectors.rules.ruleGroups.includedGroupsList().should("be.visible");
      });
    });
  });
});
