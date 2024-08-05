import { selectors as s } from "../support/selectors";

describe("tab", () => {
  it("should render the correct number of rule rows", () => {
    cy.visitWithStorage();

    s.ruleRows().should("have.length", 2);
  });

  it("should allow addition of new rule rows", () => {
    cy.visitWithStorage();

    s.addNewRuleButton().click();
    s.ruleRows().should("have.length", 3);
  });

  it("should allow addition of new rule rows when no rules exist", () => {
    cy.visitWithStorage({
      matchers: [],
    });

    s.ruleRows().should("have.length", 0);
    s.addNewRuleButton().should("be.visible");
  });
});
