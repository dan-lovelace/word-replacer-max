import { selectors as s } from "../../support/selectors";

describe("account dropdown", () => {
  describe("signed out", () => {
    beforeEach(() => {
      cy.visitWithStorage();
    });

    it("should render the logged-out state", () => {
      s.layout.accountDropdownButton().should("be.visible").click();

      s.layout.accountDropdownSignedOutContainer().should("be.visible");

      cy.findByRole("button", { name: /create an account/i }).should(
        "be.visible"
      );
      cy.findByRole("button", { name: /log in/i }).should("be.visible");
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      cy.visitWithStorage();
      cy.appUserLogin();
    });

    it("should render the signed-in state", () => {
      s.layout.accountDropdownButton().click();

      s.layout.accountDropdownSignedInMenuHeading().should("be.visible");
      s.layout
        .accountDropdownSignedInEmail()
        .should("be.visible")
        .contains(Cypress.env("VITE_TEST_USERNAME"));

      s.layout.accountDropdownSignedInMenuContainer().within(() => {
        cy.findByRole("button", { name: /account/i }).should("be.visible");
        cy.findByRole("button", { name: /sign out/i }).should("be.visible");
      });
    });

    it("should navigate to the account page", () => {
      s.layout.accountDropdownButton().click();
      s.layout.accountDropdownSignedInMenuContainer().within(() => {
        cy.findByRole("button", { name: /account/i }).click();
      });

      s.account.container().should("be.visible");
    });
  });
});
