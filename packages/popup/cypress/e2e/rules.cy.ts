import { selectors as s } from "../support/selectors";

describe("tab", () => {
  describe("rule list", () => {
    it("should render the correct number of rule rows", () => {
      cy.visitWithStorage();

      s.ruleRows().should("have.length", 2);
    });

    it("allows user to add new rule when zero exist", () => {
      cy.visitWithStorage({
        matchers: [],
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

  describe("rule row", () => {
    it("allows user to deactivate", () => {
      cy.visitWithStorage();

      s.ruleRowsFirst()
        .findByTestId("active-toggle")
        .should("be.visible")
        .click();

      cy.getBrowser().then((browser) => {
        browser.storage?.sync?.get().then((storage) => {
          // TODO: sort order
          const matchers = Object.keys(storage)
            .filter((key) => key.startsWith("matcher__"))
            .map((key) => storage[key]);

          cy.wrap(matchers?.[0]).should("have.property", "active", false);
          cy.wrap(matchers?.[1]).should("have.property", "active", true);
        });
      });
    });
  });
});
