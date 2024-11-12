import { selectors } from "../../support/selectors";

describe("replacement suggest", () => {
  it("option should not display when never used and logged out", () => {
    cy.visitWithStorage();

    selectors.ruleRowsFirst().within(() => {
      selectors.rules.replacementSuggest.dropdownToggle().should("not.exist");
    });
  });

  it("option should display when disabled and logged out", () => {
    cy.visitWithStorage({
      sync: {
        replacementSuggest: {
          active: false,
        },
      },
    });

    selectors.ruleRowsFirst().within(() => {
      selectors.rules.replacementSuggest.dropdownToggle().should("not.exist");
    });
  });

  it("option should not display when enabled and logged out", () => {
    cy.visitWithStorage({
      sync: {
        replacementSuggest: {
          active: true,
        },
      },
    });

    selectors.ruleRowsFirst().within(() => {
      selectors.rules.replacementSuggest.dropdownToggle().should("not.exist");
    });
  });

  it("option should not display when never used and logged in", () => {
    cy.visitWithStorage();

    cy.appUserLogin();

    selectors.ruleRowsFirst().within(() => {
      selectors.rules.replacementSuggest.dropdownToggle().should("not.exist");
    });
  });

  it("option should display when disabled and logged in", () => {
    cy.visitWithStorage({
      sync: {
        replacementSuggest: {
          active: false,
        },
      },
    });

    cy.appUserLogin();

    selectors.ruleRowsFirst().within(() => {
      selectors.rules.replacementSuggest.dropdownToggle().should("not.exist");
    });
  });

  it("option should display when enabled and logged in", () => {
    cy.visitWithStorage({
      sync: {
        replacementSuggest: {
          active: true,
        },
      },
    });

    cy.appUserLogin();

    selectors.ruleRowsFirst().within(() => {
      selectors.rules.replacementSuggest.dropdownToggle().should("be.visible");
    });
  });
});
