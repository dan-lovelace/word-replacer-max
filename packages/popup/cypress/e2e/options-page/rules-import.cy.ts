import { selectors as s } from "../../support/selectors";

describe("rules import", () => {
  beforeEach(() => {
    cy.visitWithStorage();
    s.optionsTab().click();
  });

  it("should add rules from a csv file", () => {
    cy.fixture("rules-import.csv").as("rulesImport");
    s.options.rulesImport.label().selectFile("@rulesImport");

    s.layout.tabs.rules().click();
    s.ruleRows().then((ruleRows) => {
      expect(ruleRows.length).to.eq(4);

      const thirdRow = ruleRows.eq(2);
      const fourthRow = ruleRows.eq(3);

      cy.wrap(thirdRow).within(() => {
        s.rules.queryInput.chips().then((chips) => {
          expect(chips.length).to.eq(3);

          cy.contains("Word1");
          cy.contains("Word2, Word3");
          cy.contains("Word4");
        });
      });

      cy.wrap(fourthRow).within(() => {
        s.rules.queryInput.chips().then((chips) => {
          expect(chips.length).to.eq(4);

          cy.contains("Word5");
          cy.contains("Word6");
          cy.contains("Word7");
          cy.contains("Word8");
        });
      });
    });
  });

  it("should not add rules from an empty csv file", () => {
    cy.fixture("empty-rules-import.csv").as("emptyRulesImport");
    s.options.rulesImport.label().selectFile("@emptyRulesImport");

    s.layout.tabs.rules().click();
    s.ruleRows().then((ruleRows) => {
      expect(ruleRows.length).to.eq(2);
    });
  });
});