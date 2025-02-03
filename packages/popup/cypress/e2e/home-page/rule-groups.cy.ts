import {
  getMatcherGroups,
  sortMatcherGroups,
} from "@worm/shared/src/browser/matchers";
import { MatcherGroupInSync } from "@worm/types/src/rules";

import {
  generateMatcherGroups,
  generateMatchers,
  TEST_GROUP_ID_1,
  TEST_GROUP_ID_2,
  TEST_MATCHER_ID_1,
  TEST_MATCHER_ID_2,
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

function deleteFirstGroup() {
  selectors.ruleGroups.manageModal
    .ruleGroupRows()
    .first()
    .within(() => {
      selectors.ruleGroups.manageModal.deleteGroupButton().click();
      selectors.ruleGroups.manageModal.deleteGroupButton().click();
    });
}

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

      it("should display when logged out and feature is enabled", () => {
        cy.visitWithStorage({
          sync: {
            ...defaultTestMatcherGroups,
            ruleGroups: {
              active: true,
            },
          },
        });

        selectors.ruleGroups.toolbar.root().should("be.visible");
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

    describe("groups management", () => {
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
        cy.findByRole("button", { name: /add group/i }).should("be.visible");
      });

      it("should show an alert when no groups exist", () => {
        selectors.ruleGroups.toolbar.modalToggleButton().click();
        deleteFirstGroup();
        deleteFirstGroup();

        cy.contains(/create your first group/i).should("be.visible");
        cy.findByRole("button", { name: /add group/i }).should("be.visible");
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

            selectors.ruleGroups.manageModal
              .deleteGroupButton()
              .should((button) => {
                const bgColor = button.css("background-color");

                // inconsistent results during test run, just make sure it's red
                expect(
                  ["rgb(187, 45, 59)", "rgb(220, 53, 69)"].includes(bgColor)
                ).to.be.true;
              });
          });

        selectors.ruleGroups.manageModal
          .ruleGroupRows()
          .should("have.length", 2);
      });

      it("should delete a group after confirmation", () => {
        selectors.ruleGroups.toolbar.modalToggleButton().click();
        deleteFirstGroup();

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

    describe("rule filtering", () => {
      const testMatchers = generateMatchers({
        matcher__1111: {
          active: true,
          identifier: "1111",
          queries: ["lorem"],
          queryPatterns: [],
          replacement: "ipsum",
        },
        matcher__2222: {
          active: true,
          identifier: "2222",
          queries: ["sit"],
          queryPatterns: [],
          replacement: "dolor",
        },
      });

      it("should not filter rules when groups are active and feature is disabled", () => {
        cy.visitWithStorage({
          sync: {
            ...generateMatcherGroups({
              [TEST_GROUP_ID_1]: {
                active: true,
                color: "red",
                identifier: "1234",
                matchers: [testRules[TEST_MATCHER_ID_1].identifier],
                name: "Override Group 1",
              },
            }),
            ...testMatchers,
            ruleGroups: {
              active: false,
            },
          },
        });
        cy.appUserLogin();

        selectors.ruleRows().should("have.length", 4);
      });

      it("should filter rules when groups are active and feature is enabled", () => {
        cy.visitWithStorage({
          sync: {
            ...generateMatcherGroups({
              [TEST_GROUP_ID_1]: {
                active: true,
                color: "red",
                identifier: "1234",
                matchers: [testRules[TEST_MATCHER_ID_1].identifier, "1111"],
                name: "Override Group 1",
              },
            }),
            ...testMatchers,
            ruleGroups: {
              active: true,
            },
          },
        });
        cy.appUserLogin();

        selectors.ruleRows().should("have.length", 2);
      });

      it("should filter rules when selecting a group", () => {
        cy.visitWithStorage({
          sync: {
            ...generateMatcherGroups({
              [TEST_GROUP_ID_1]: {
                active: false,
                color: "red",
                identifier: "1234",
                matchers: [testRules[TEST_MATCHER_ID_1].identifier, "1111"],
                name: "Override Group 1",
              },
              [TEST_GROUP_ID_2]: {
                active: false,
                color: "green",
                identifier: "5678",
                matchers: ["2222"],
                name: "Override Group 2",
              },
            }),
            ...testMatchers,
            ruleGroups: {
              active: true,
            },
          },
        });
        cy.appUserLogin();

        selectors.ruleGroups.toolbar.groupToggles().eq(0).click();
        selectors.ruleRows().should("have.length", 2);

        selectors.ruleGroups.toolbar.groupToggles().eq(1).click();
        selectors.ruleRows().should("have.length", 1);
      });

      it("should filter rules when deselecting a group", () => {
        cy.visitWithStorage({
          sync: {
            ...generateMatcherGroups({
              [TEST_GROUP_ID_1]: {
                active: true,
                color: "red",
                identifier: "1234",
                matchers: [testRules[TEST_MATCHER_ID_1].identifier],
                name: "Override Group 1",
              },
            }),
            ...testMatchers,
            ruleGroups: {
              active: true,
            },
          },
        });
        cy.appUserLogin();

        selectors.ruleRows().should("have.length", 1);

        selectors.ruleGroups.toolbar.groupToggles().eq(0).click();
        selectors.ruleRows().should("have.length", 4);
      });

      it("should filter rules when selecting multiple groups", () => {
        cy.visitWithStorage({
          sync: {
            ...generateMatcherGroups({
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
                matchers: [testRules[TEST_MATCHER_ID_2].identifier],
                name: "Override Group 2",
              },
            }),
            ...testMatchers,
            ruleGroups: {
              active: true,
            },
          },
        });
        cy.appUserLogin();

        selectors.ruleRows().should("have.length", 4);

        selectors.ruleGroups.toolbar.groupToggles().eq(0).click();
        selectors.ruleGroups.toolbar
          .groupToggles()
          .eq(1)
          .click({ ctrlKey: true });
        selectors.ruleRows().should("have.length", 2);
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

      it("should allow adding to a new group", () => {
        selectors
          .ruleRows()
          .eq(1)
          .within(() => {
            selectors.rules.ruleGroups.addToGroupMenu.toggleButton().click();
            selectors.rules.ruleGroups.addToGroupMenu
              .root()
              .should("be.visible");
            selectors.rules.ruleGroups.addToGroupMenu
              .addToGroupButtons()
              .eq(0)
              .click();
            selectors.rules.ruleGroups.addToGroupMenu
              .root()
              .should("not.exist");

            selectors.rules.ruleGroups.includedGroupsList().within(() => {
              selectors.rules.ruleGroups.groupColors().should("have.length", 1);
            });
          });
      });

      it("should show an alert when adding to a group with no available groups", () => {
        selectors
          .ruleRows()
          .eq(0)
          .within(() => {
            selectors.rules.ruleGroups.addToGroupMenu.toggleButton().click();
            selectors.rules.ruleGroups.addToGroupMenu
              .root()
              .contains(/no more groups available/i);
          });
      });

      it("should disable the option to add to group when no groups exist", () => {
        selectors.ruleGroups.toolbar.modalToggleButton().click();
        selectors.ruleGroups.manageModal.ruleGroupRows().each((row) => {
          cy.wrap(row).within(() => {
            selectors.ruleGroups.manageModal.deleteGroupButton().click();
            selectors.ruleGroups.manageModal.deleteGroupButton().click();
          });
        });
        selectors.ruleGroups.toolbar.modalToggleButton().click({ force: true });

        selectors
          .ruleRows()
          .eq(0)
          .within(() => {
            selectors.rules.ruleGroups.addToGroupMenu
              .toggleButton()
              .should("have.attr", "disabled");
          });
      });

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
