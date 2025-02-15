import {
  DEFAULT_TONE_OPTION,
  toneOptions,
} from "@worm/shared/src/replace/lib/suggest";

import { interceptSuggest } from "../../support/interceptors/suggest";
import { selectors } from "../../support/selectors";

describe("replacement suggest", () => {
  describe("feature availability", () => {
    it("option should not display when never used and logged out", () => {
      cy.visitWithStorage();

      selectors.ruleRowsFirst().within(() => {
        selectors.rules.replacementSuggest
          .dropdownToggle()
          .should("not.be.visible");
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
        selectors.rules.replacementSuggest
          .dropdownToggle()
          .should("not.be.visible");
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
        selectors.rules.replacementSuggest
          .dropdownToggle()
          .should("not.be.visible");
      });
    });

    it("option should not display when never used and logged in", () => {
      cy.visitWithStorage();

      cy.appUserLogin();

      selectors.ruleRowsFirst().within(() => {
        selectors.rules.replacementSuggest
          .dropdownToggle()
          .should("not.be.visible");
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
        selectors.rules.replacementSuggest
          .dropdownToggle()
          .should("not.be.visible");
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
        selectors.rules.replacementSuggest
          .dropdownToggle()
          .should("be.visible");
      });
    });
  });

  describe("functionality", () => {
    beforeEach(() => {
      cy.visitWithStorage({
        sync: {
          replacementSuggest: {
            active: true,
          },
        },
      });

      cy.appUserLogin();
    });

    it("should open the dropdown menu when clicking the toggle", () => {
      selectors.ruleRowsFirst().within(() => {
        selectors.rules.replacementSuggest.dropdownToggle().click();
        selectors.rules.replacementSuggest.dropdownMenu
          .root()
          .should("be.visible");
      });
    });

    it("should close the dropdown menu when clicking away", () => {
      selectors.ruleRowsFirst().within(() => {
        selectors.rules.replacementSuggest.dropdownToggle().click();
        selectors.rules.replacementSuggest.dropdownMenu
          .root()
          .should("be.visible");
        selectors.rules.replacementSuggest.dropdownToggle().click();
        selectors.rules.replacementSuggest.dropdownMenu
          .root()
          .should("not.exist");
      });
    });

    it("should generate suggestions using default values", () => {
      interceptSuggest();

      selectors.ruleRowsFirst().within(() => {
        selectors.rules.replacementSuggest.dropdownToggle().click();
        selectors.rules.replacementSuggest.dropdownMenu.submitButton().click();
      });

      selectors.rules.replacementSuggest.dropdownMenu
        .resultsListSpinner()
        .should("be.visible");

      cy.wait("@suggestResult").then(() => {
        selectors.rules.replacementSuggest.dropdownMenu
          .resultsList()
          .should("be.visible");

        const toneLabel =
          toneOptions.find((option) => option.value === DEFAULT_TONE_OPTION)
            ?.label ?? "SHOULD_BREAK";

        selectors.rules.replacementSuggest.dropdownMenu
          .resultsTone()
          .contains(`${toneLabel} alternatives`);

        selectors.rules.replacementSuggest.dropdownMenu
          .resultsItems()
          .then((resultsItems) => {
            cy.wrap(resultsItems).should("have.length", 5);
          });
      });
    });

    it("should apply suggestion when selected", () => {
      interceptSuggest();

      selectors.ruleRowsFirst().within(() => {
        selectors.rules.replacementSuggest.dropdownToggle().click();
        selectors.rules.replacementSuggest.dropdownMenu.submitButton().click();
      });

      cy.wait("@suggestResult").then((response) => {
        const firstSuggestion =
          response.response?.body.data.suggestions[0].text ?? "SHOULD_BREAK";

        selectors.rules.replacementSuggest.dropdownMenu
          .resultsItems()
          .first()
          .click();

        selectors.ruleRowsFirst().within(() => {
          selectors.rules.replacementInput
            .textInput()
            .invoke("val")
            .then((replacementValue) => {
              cy.wrap(replacementValue).should("eq", firstSuggestion);
            });
        });
      });
    });

    it("should display recent suggestions when reopening the dropdown", () => {
      interceptSuggest();

      selectors.ruleRowsFirst().within(() => {
        selectors.rules.replacementSuggest.dropdownToggle().click();
        selectors.rules.replacementSuggest.dropdownMenu.submitButton().click();
      });

      cy.wait("@suggestResult").then(() => {
        selectors.rules.replacementSuggest.dropdownMenu
          .resultsItems()
          .first()
          .click();

        selectors.ruleRowsFirst().within(() => {
          selectors.rules.replacementSuggest.dropdownToggle().click();
        });

        selectors.rules.replacementSuggest.dropdownMenu
          .resultsItems()
          .then((resultsItems) => {
            cy.wrap(resultsItems).should("have.length", 5);
          });
      });
    });

    it("should make follow-up suggestions when some already exist", () => {
      interceptSuggest();

      selectors.ruleRowsFirst().within(() => {
        selectors.rules.replacementSuggest.dropdownToggle().click();
        selectors.rules.replacementSuggest.dropdownMenu.submitButton().click();
      });

      cy.wait("@suggestResult").then(() => {
        selectors.rules.replacementSuggest.dropdownMenu.submitButton().click();

        cy.wait("@suggestResult").then(() => {
          selectors.rules.replacementSuggest.dropdownMenu
            .resultsItems()
            .then((resultsItems) => {
              cy.wrap(resultsItems).should("have.length", 5);
            });
        });
      });
    });
  });
});
