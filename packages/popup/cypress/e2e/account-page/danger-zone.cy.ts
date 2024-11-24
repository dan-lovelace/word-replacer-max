import { STORAGE_MATCHER_PREFIX } from "@worm/shared/src/browser/matchers";

import english from "../../../src/lib/language/english";

import { selectors as s } from "../../support/selectors";

describe("danger zone", () => {
  beforeEach(() => {
    cy.visitWithStorage();
    cy.appUserLogin();

    s.layout.accountDropdownButton().click();
    s.layout.accountDropdownSignedInMenuContainer().within(() => {
      s.layout.accountDropdownAccountButton().click();
    });
  });

  it("should render with delete options", () => {
    s.account.dangerZone.root().should("be.visible");
    s.account.dangerZone.deleteAccountContainer().should("be.visible");
    s.account.dangerZone.deleteAllRulesContainer().should("be.visible");
  });

  it("should render delete all rules confirmation", () => {
    s.account.dangerZone.deleteAllRulesButton().click();

    s.account.dangerZone
      .deleteAllRulesConfirmationContainer()
      .should("be.visible");

    s.account.dangerZone
      .deleteAllRulesConfirmationAlert()
      .should("be.visible")
      .within(() => {
        cy.contains(
          english.account.DANGER_ZONE_DELETE_RULES_CONFIRMATION_TITLE
        );
        cy.contains(english.account.DANGER_ZONE_DELETE_RULES_CONFIRMATION_BODY);
        cy.contains(
          english.account
            .DANGER_ZONE_DELETE_RULES_CONFIRMATION_CANCEL_BUTTON_TEXT
        );
        cy.contains(
          english.account.DANGER_ZONE_DELETE_RULES_CONFIRMATION_INPUT_LABEL
        );
      });
  });

  it("should allow canceling delete all rules", () => {
    s.account.dangerZone.deleteAllRulesButton().click();

    s.account.dangerZone.deleteAllRulesConfirmationContainer().within(() => {
      s.account.dangerZone.deleteAllRulesConfirmationCancelButton().click();
    });

    s.account.dangerZone.deleteAllRulesContainer().should("be.visible");
    s.account.dangerZone
      .deleteAllRulesConfirmationContainer()
      .should("not.exist");
  });

  it("should delete all rules when confirmed", () => {
    // Verify rules exist in storage
    cy.getBrowser().then((browser) => {
      browser.storage.sync?.get().then((syncStorage) => {
        const matchers = Object.keys(syncStorage).filter((key) =>
          key.startsWith(STORAGE_MATCHER_PREFIX)
        );

        expect(matchers).to.have.length(2);
      });
    });

    // Delete all rules
    s.account.dangerZone.deleteAllRulesButton().click();
    s.account.dangerZone.deleteAllRulesConfirmationContainer().within(() => {
      s.account.dangerZone.deleteAllRulesConfirmationCheckbox().check();
      s.account.dangerZone.deleteAllRulesConfirmationSubmitButton().click();
    });

    // Verify rules were deleted from storage
    cy.getBrowser().then((browser) => {
      browser.storage.sync?.get().then((syncStorage) => {
        const matchers = Object.keys(syncStorage).filter((key) =>
          key.startsWith(STORAGE_MATCHER_PREFIX)
        );

        expect(matchers).to.have.length(0);
      });
    });

    // Verify rules list is empty
    s.layout.tabs.rules().click();
    s.rules.list.emptyRulesListAlert().should("be.visible");
  });

  it("should render delete account confirmation", () => {
    s.account.dangerZone.deleteAccountButton().click();

    s.account.dangerZone
      .deleteAccountConfirmationContainer()
      .should("be.visible");

    s.account.dangerZone
      .deleteAccountConfirmationAlert()
      .should("be.visible")
      .within(() => {
        cy.contains(
          english.account.DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_TITLE
        );
        cy.contains(
          english.account.DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_BODY
        );
        cy.contains(
          english.account
            .DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_CANCEL_BUTTON_TEXT
        );
        cy.contains(
          english.account.DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_INPUT_LABEL
        );
      });
  });

  it("should allow canceling delete account", () => {
    s.account.dangerZone.deleteAccountButton().click();

    s.account.dangerZone.deleteAccountConfirmationContainer().within(() => {
      s.account.dangerZone.deleteAccountConfirmationCancelButton().click();
    });

    s.account.dangerZone.deleteAccountContainer().should("be.visible");
    s.account.dangerZone
      .deleteAccountConfirmationContainer()
      .should("not.exist");
  });
});
