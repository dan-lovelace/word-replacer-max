import { selectors as s } from "../../support/selectors";

describe("rules import", () => {
  beforeEach(() => {
    cy.visitWithStorage();
    s.optionsTab().click();
  });

  it("should add rules from a csv file", () => {
    cy.fixture("rules-import-no-replacements.csv").as("rulesImport");
    s.options.rulesImport.fileInputLabel().selectFile("@rulesImport");

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

  it("should add rules with replacements from a csv file", () => {
    cy.fixture("rules-import-replacements.csv").as("rulesImport");
    s.options.rulesImport.fileInputLabel().selectFile("@rulesImport");

    s.layout.tabs.rules().click();
    s.ruleRows().then((ruleRows) => {
      expect(ruleRows.length).to.eq(5);

      const thirdRow = ruleRows.eq(2);
      const fourthRow = ruleRows.eq(3);
      const fifthRow = ruleRows.eq(4);

      cy.wrap(thirdRow).within(() => {
        s.rules.queryInput.chips().then((chips) => {
          expect(chips.length).to.eq(3);

          cy.contains("Word1");
          cy.contains("Word2");
          cy.contains("Word3 and Word4");
        });

        s.rules.replacementInput
          .textInput()
          .should("have.value", "Replacement1");
      });

      cy.wrap(fourthRow).within(() => {
        s.rules.queryInput.chips().then((chips) => {
          expect(chips.length).to.eq(4);

          cy.contains("Word5");
          cy.contains("Word6");
          cy.contains("Word7");
          cy.contains("Word8");
        });

        s.rules.replacementInput
          .textInput()
          .should("have.value", "Replacement2");
      });

      cy.wrap(fifthRow).within(() => {
        s.rules.queryInput.chips().then((chips) => {
          expect(chips.length).to.eq(1);

          cy.contains("Word3");
        });

        s.rules.replacementInput.textInput().should("have.value", "");
      });
    });
  });

  it("should not add rules from an empty csv file", () => {
    cy.fixture("empty-rules-import.csv").as("emptyRulesImport");
    s.options.rulesImport.fileInputLabel().selectFile("@emptyRulesImport");

    s.layout.tabs.rules().click();
    s.ruleRows().then((ruleRows) => {
      expect(ruleRows.length).to.eq(2);
    });
  });

  it("should retain sort order of exports when importing from file", () => {
    cy.fixture("rules-import.json").as("rulesImport");
    s.options.rulesImport.fileInputLabel().selectFile("@rulesImport");

    s.layout.tabs.rules().click();
    s.ruleRows().then((ruleRows) => {
      expect(ruleRows.length).to.eq(12);

      cy.wrap(ruleRows.slice(2)).each((row, idx) => {
        cy.wrap(row).within(() => {
          s.rules.queryInput.chips().then(() => {
            cy.contains((idx + 1) % 10);
          });
        });
      });
    });
  });

  it("should retain sort order of exports when importing from link", () => {
    cy.intercept("https://cdn.wordreplacermax.com/*.json", {
      fixture: "rules-import.json",
    }).as("share");

    s.options.rulesImport.linkImportButton().click();
    s.options.rulesImport.linkImportForm().within(() => {
      s.options.rulesImport
        .linkImportUrlInput()
        .type("https://cdn.wordreplacermax.com/fake.json");
      cy.findByRole("button", { name: /import/i }).click();
    });

    cy.wait("@share").then(() => {
      s.layout.tabs.rules().click();
      s.ruleRows().then((ruleRows) => {
        expect(ruleRows.length).to.eq(12);

        cy.wrap(ruleRows.slice(2)).each((row, idx) => {
          cy.wrap(row).within(() => {
            s.rules.queryInput.chips().then(() => {
              cy.contains((idx + 1) % 10);
            });
          });
        });
      });
    });
  });
});
