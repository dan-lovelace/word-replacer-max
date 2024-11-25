import english from "../../../src/lib/language/english";

import { interceptContactSupport } from "../../support/interceptors/contact";
import { selectors as s } from "../../support/selectors";

describe("contact support", () => {
  describe("feature availability", () => {
    it("should render logged out options when logged out", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "support",
          },
        },
      });

      s.support.loggedInContactOptions().should("not.exist");
      s.support.loggedOutContactOptions().should("be.visible");
    });

    it("should render logged in options when logged in", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "support",
          },
        },
      });

      cy.appUserLogin();

      s.support.loggedInContactOptions().should("be.visible");
      s.support.loggedOutContactOptions().should("not.exist");
    });
  });

  describe("form", () => {
    beforeEach(() => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "support",
          },
        },
      });

      cy.appUserLogin();
    });

    it("should disallow empty message submission", () => {
      s.support.contactSupportFormSubmitButton().click();

      s.support
        .contactSupportFormMessageInput()
        .should("have.attr", "required");

      s.support.contactSupportFormMessageInput().should("match", ":invalid");
    });

    it("should show error when trimmed message is empty", () => {
      s.support.contactSupportFormMessageInput().type(" ");

      s.support.contactSupportFormSubmitButton().click();
      s.support
        .contactSupportFormMessageError()
        .should("be.visible")
        .contains(/message is required/i);
    });

    it("should submit form when valid", () => {
      interceptContactSupport();

      s.support
        .contactSupportFormMessageInput()
        .type("Test message from Cypress");
      s.support.contactSupportFormSubmitButton().click();

      cy.wait("@contactSupportResult").then(() => {
        cy.contains(english.support.CONTACT_SUPPORT_FORM_SUCCESS_MESSAGE);

        s.support.contactSupportFormMessageInput().should("have.value", "");
      });
    });

    it("should show error when form submission fails", () => {
      const testMessage = "Test message from Cypress";

      interceptContactSupport({
        statusCode: 400,
      });

      s.support.contactSupportFormMessageInput().type(testMessage);
      s.support.contactSupportFormSubmitButton().click();

      cy.wait("@contactSupportResult").then(() => {
        cy.contains(english.support.CONTACT_SUPPORT_FORM_GENERAL_ERROR);

        s.support
          .contactSupportFormMessageInput()
          .should("have.value", testMessage);
      });
    });
  });
});
