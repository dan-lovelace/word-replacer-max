import {
  getMatcherGroups,
  sortMatcherGroups,
} from "@worm/shared/src/browser/matchers";
import { MatcherGroupInSync } from "@worm/types/src/rules";

import {
  generateMatcherGroups,
  TEST_GROUP_ID_1,
  TEST_GROUP_ID_2,
  TEST_MATCHER_ID_1,
  testRules,
} from "../../support/generators/rules";
import { selectors } from "../../support/selectors";

const defaultTestMatcherGroups = generateMatcherGroups({
  [TEST_GROUP_ID_1]: {
    active: false,
    color: "red",
    identifier: "1234",
    matchers: [testRules[TEST_MATCHER_ID_1].identifier],
    name: "Override Group 1",
  },
});

describe("home page rule groups", () => {
  describe("toolbar", () => {
    describe("feature availability", () => {
      it("should not display when logged out and feature is disabled", () => {
        cy.visitWithStorage({
          sync: {
            ...defaultTestMatcherGroups,
          },
        });

        selectors.ruleGroups.toolbar.root().should("not.exist");
      });

      it("should not display when logged out and feature is enabled", () => {
        cy.visitWithStorage({
          sync: {
            ...defaultTestMatcherGroups,
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
            ...defaultTestMatcherGroups,
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
            ...defaultTestMatcherGroups,
            ruleGroups: {
              active: true,
            },
          },
        });
        cy.appUserLogin();

        selectors.ruleGroups.toolbar.root().should("be.visible");
      });
    });

    describe("functionality", () => {
      beforeEach(() => {
        cy.visitWithStorage({
          sync: {
            ...defaultTestMatcherGroups,
            ruleGroups: {
              active: true,
            },
          },
        });
        cy.appUserLogin();
      });

      it("should open the groups management modal", () => {
        selectors.ruleGroups.toolbar.modalToggleButton().click();

        cy.findByRole("heading", { name: /manage groups/i }).should(
          "be.visible"
        );
        selectors.ruleGroups.manageModal
          .ruleGroupRows()
          .should("have.length", 2);
        cy.findByRole("button", { name: /new group/i }).should("be.visible");
      });

      it("should allow adding a new group", () => {
        selectors.ruleGroups.toolbar.modalToggleButton().click();

        selectors.ruleGroups.manageModal.addGroupButton().click();
        selectors.ruleGroups.manageModal
          .ruleGroupRows()
          .should("have.length", 3);
        selectors.ruleGroups.manageModal
          .ruleGroupRows()
          .eq(2)
          .within(() => {
            selectors.ruleGroups.manageModal
              .nameInput()
              .should("have.value", "Group 1");
          });

        cy.getBrowser().then(async (browser) => {
          const syncStorage = await browser.storage.sync?.get();
          const groups = getMatcherGroups(syncStorage ?? {});
          const groupsArray = sortMatcherGroups(Object.values(groups ?? {}));

          cy.wrap(groupsArray).should("have.length", 3);
        });
      });

      it("should confirm when deleting a group", () => {
        selectors.ruleGroups.toolbar.modalToggleButton().click();

        selectors.ruleGroups.manageModal
          .ruleGroupRows()
          .first()
          .within(() => {
            selectors.ruleGroups.manageModal.deleteGroupButton().click();

            cy.wait(500); // wait for color transition in headless mode

            selectors.ruleGroups.manageModal
              .deleteGroupButton()
              .should("have.css", "background-color", "rgb(187, 45, 59)");
          });

        selectors.ruleGroups.manageModal
          .ruleGroupRows()
          .should("have.length", 2);
      });

      it("should delete a group after confirmation", () => {
        selectors.ruleGroups.toolbar.modalToggleButton().click();

        selectors.ruleGroups.manageModal
          .ruleGroupRows()
          .first()
          .within(() => {
            selectors.ruleGroups.manageModal.deleteGroupButton().click();
            selectors.ruleGroups.manageModal.deleteGroupButton().click();
          });

        selectors.ruleGroups.manageModal
          .ruleGroupRows()
          .should("have.length", 1)
          .eq(0)
          .within(() => {
            selectors.ruleGroups.manageModal
              .nameInput()
              .should("have.value", "Test Group 2");
          });

        cy.getBrowser().then(async (browser) => {
          const syncStorage = await browser.storage.sync?.get();
          const groups = getMatcherGroups(syncStorage ?? {});
          const groupsArray = sortMatcherGroups(Object.values(groups ?? {}));

          cy.wrap(groupsArray).should("have.length", 1);
        });
      });

      it("should allow updating groups", () => {
        const testColor = "rgb(0, 0, 255)";
        const testName = "Updated Group";

        selectors.ruleGroups.toolbar.modalToggleButton().click();

        selectors.ruleGroups.manageModal
          .ruleGroupRows()
          .eq(1)
          .within(() => {
            selectors.ruleGroups.manageModal
              .nameInput()
              .clear()
              .type(testName)
              .blur();

            selectors.colorSelect.customInput().clear().type(testColor).blur();
          });

        cy.getBrowser().then(async (browser) => {
          const syncStorage = await browser.storage.sync?.get();
          const groups = getMatcherGroups(syncStorage ?? {});
          const groupsArray = sortMatcherGroups(Object.values(groups ?? {}));

          cy.wrap(groupsArray[1].color).should("eq", testColor);
          cy.wrap(groupsArray[1].name).should("eq", testName);
        });
      });
    });
  });

  describe("rules row", () => {
    describe("feature availability", () => {
      it("should not display included groups when logged out and feature is disabled", () => {
        cy.visitWithStorage({
          sync: {
            ...defaultTestMatcherGroups,
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
            ...defaultTestMatcherGroups,
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
            ...defaultTestMatcherGroups,
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
            ...defaultTestMatcherGroups,
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

    describe("functionality", () => {
      const testMatcherGroups: MatcherGroupInSync = {
        [TEST_GROUP_ID_1]: {
          active: false,
          color: "red",
          identifier: "1234",
          matchers: [testRules[TEST_MATCHER_ID_1].identifier],
          name: "Override Group 1",
        },
        [TEST_GROUP_ID_2]: {
          active: false,
          color: "green",
          identifier: "5678",
          matchers: [testRules[TEST_MATCHER_ID_1].identifier],
          name: "Override Group 2",
        },
      };

      beforeEach(() => {
        cy.visitWithStorage({
          sync: {
            ...generateMatcherGroups(testMatcherGroups),
            ruleGroups: {
              active: true,
            },
          },
        });
        cy.appUserLogin();
      });

      it("should display each included group", () => {
        selectors.ruleRowsFirst().within(() => {
          selectors.rules.ruleGroups
            .removeFromGroupButtons()
            .should("have.length", 2);

          selectors.rules.ruleGroups
            .groupColors()
            .eq(0)
            .should("have.css", "background-color", "rgb(255, 0, 0)")
            .trigger("mouseover");

          selectors.rules.ruleGroups
            .groupColors()
            .eq(1)
            .should("have.css", "background-color", "rgb(0, 128, 0)");
        });

        selectors.tooltip
          .inner()
          .should("be.visible")
          .contains(/override group 1/i);
      });

      it("should allow adding to a new group", () => {});

      it("should allow removal from group", () => {
        selectors.ruleRowsFirst().within(() => {
          selectors.rules.ruleGroups.groupColors().eq(0).click();

          selectors.rules.ruleGroups
            .removeFromGroupButtons()
            .should("have.length", 1);

          cy.getBrowser().then(async (browser) => {
            const syncStorage = await browser.storage.sync?.get();
            const groups = getMatcherGroups(syncStorage ?? {});

            cy.wrap(groups?.[TEST_GROUP_ID_1].matchers).should(
              "have.length",
              0
            );
            cy.wrap(groups?.[TEST_GROUP_ID_2].matchers).should(
              "have.length",
              1
            );
          });
        });
      });
    });
  });
});
