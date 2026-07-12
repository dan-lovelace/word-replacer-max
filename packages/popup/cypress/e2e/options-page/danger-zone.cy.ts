import { matchersFromStorage } from "@worm/shared/src/browser/matchers";

import english from "../../../src/lib/language/english";

import { selectors as s } from "../../support/selectors";

describe("danger zone", () => {
  beforeEach(() => {
    cy.visitWithStorage({
      sync: {
        preferences: {
          activeTab: "options",
        },
      },
    });
  });

  it("should render with delete options", () => {
    s.options.dangerZone.root().scrollIntoView().should("be.visible");
    s.options.dangerZone.deleteAllRulesContainer().should("be.visible");
  });

  it("should render delete all rules confirmation", () => {
    s.options.dangerZone.deleteAllRulesButton().click();

    s.options.dangerZone
      .deleteAllRulesConfirmationContainer()
      .should("be.visible");

    s.options.dangerZone
      .deleteAllRulesConfirmationAlert()
      .should("be.visible")
      .within(() => {
        cy.contains(
          english.options.DANGER_ZONE_DELETE_RULES_CONFIRMATION_TITLE
        );
        cy.contains(english.options.DANGER_ZONE_DELETE_RULES_CONFIRMATION_BODY);
        cy.contains(
          english.options
            .DANGER_ZONE_DELETE_RULES_CONFIRMATION_CANCEL_BUTTON_TEXT
        );
        cy.contains(
          english.options.DANGER_ZONE_DELETE_RULES_CONFIRMATION_INPUT_LABEL
        );
      });
  });

  it("should allow canceling delete all rules", () => {
    s.options.dangerZone.deleteAllRulesButton().click();

    s.options.dangerZone.deleteAllRulesConfirmationContainer().within(() => {
      s.options.dangerZone.deleteAllRulesConfirmationCancelButton().click();
    });

    s.options.dangerZone.deleteAllRulesContainer().should("be.visible");
    s.options.dangerZone
      .deleteAllRulesConfirmationContainer()
      .should("not.exist");
  });

  it("should delete all rules when confirmed", () => {
    // Verify rules exist in storage
    cy.getBrowser().then((browser) => {
      browser.storage.sync?.get().then((syncStorage) => {
        const matchers = matchersFromStorage(syncStorage);

        expect(matchers).to.have.length(2);
      });
    });

    // Delete all rules
    s.options.dangerZone.deleteAllRulesButton().click();
    s.options.dangerZone.deleteAllRulesConfirmationContainer().within(() => {
      s.options.dangerZone.deleteAllRulesConfirmationCheckbox().check();
      s.options.dangerZone.deleteAllRulesConfirmationSubmitButton().click();
    });

    // Verify rules were deleted from storage
    cy.getBrowser().then((browser) => {
      browser.storage.sync?.get().then((syncStorage) => {
        const matchers = matchersFromStorage(syncStorage);

        expect(matchers).to.eq(undefined);
      });
    });

    // Verify rules list is empty
    s.layout.tabs.rules().click();
    s.rules.list.emptyRulesListAlert().should("be.visible");
  });
});
