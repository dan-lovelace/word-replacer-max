import { QUERY_PASTE_DELIMITER } from "@web-extension/shared/src/strings";

import {
  TEST_MATCHER_ID_1,
  TEST_MATCHER_ID_2,
} from "../../support/generators/rules";
import { selectors as s } from "../../support/selectors";

describe("rules", () => {
  describe("list", () => {
    it("should render the correct number of rule rows", () => {
      cy.visitWithStorage();

      s.ruleRows().should("have.length", 2);
    });

    it("allows user to add new rule when zero exist", () => {
      cy.visitWithStorage({
        sync: {
          domainList: [],
          [TEST_MATCHER_ID_1]: undefined,
          [TEST_MATCHER_ID_2]: undefined,
          preferences: {
            activeTab: "rules",
            domainListEffect: "deny",
            extensionEnabled: true,
            focusRule: {
              field: "replacement",
              matcher: "",
            },
          },
        },
      });

      s.ruleRows().should("have.length", 0);
      s.addNewRuleButton().should("be.visible").click();
      s.ruleRows().should("have.length", 1);
    });

    it("allows user to add new rule when more than zero exist", () => {
      cy.visitWithStorage();

      s.ruleRows().should("have.length", 2);
      s.addNewRuleButton().should("be.visible").click();
      s.ruleRows().should("have.length", 3);
    });
  });

  describe("row", () => {
    it("allows user to deactivate", () => {
      cy.visitWithStorage();

      s.ruleRowsFirst()
        .findByTestId("active-toggle")
        .should("be.visible")
        .click();

      cy.getBrowser().then((browser) => {
        browser.storage?.sync?.get().then((storage) => {
          const matchers = Object.keys(storage)
            .filter((key) => key.startsWith("matcher__"))
            .map((key) => storage[key]);

          cy.wrap(matchers?.[0]).should("have.property", "active", false);
          cy.wrap(matchers?.[1]).should("have.property", "active", true);
        });
      });
    });

    describe("query input", () => {
      describe("paste", () => {
        const navigateAndPaste = (pasteValue: string, holdShift = false) => {
          cy.visitWithStorage();

          s.addNewRuleButton().click();

          s.ruleRows()
            .last()
            .within(() => {
              s.rules.queryInput
                .input()
                .focus()
                .paste(pasteValue, { holdShift });
            });
        };

        it("does not add queries when no delimiters exist", () => {
          navigateAndPaste("lorem");

          s.ruleRows()
            .last()
            .within(() => {
              s.rules.queryInput.chips().should("have.length", 0);
            });
        });

        it("does not add queries when a delimiter exists and the shift key is held", () => {
          navigateAndPaste(`lorem${QUERY_PASTE_DELIMITER}ipsum`, true);

          s.ruleRows()
            .last()
            .within(() => {
              s.rules.queryInput.chips().should("have.length", 0);
            });
        });

        it("adds queries when a delimiter exists", () => {
          navigateAndPaste(`lorem${QUERY_PASTE_DELIMITER}ipsum`);

          s.ruleRows()
            .last()
            .within(() => {
              s.rules.queryInput.chips().then((chips) => {
                expect(chips.length).to.eq(2);

                cy.contains("lorem");
                cy.contains("ipsum");
              });
            });
        });
      });
    });
  });
});
