import { selectors as s } from "../../support/selectors";

describe("disabled banner", () => {
  it("should not render when initializing with the extension enabled", () => {
    cy.visitWithStorage();

    s.layout.disabledBanner.root().should("not.be.visible");
  });

  it("should not render when initializing with the extension enabled and disabling", () => {
    cy.visitWithStorage();

    s.layout.extensionEnabledToggleButton().click();

    // small wait to be sure no race conditions exist
    cy.wait(50);

    s.layout.disabledBanner.root().should("not.be.visible");
  });

  it("should render when initializing with the extension disabled", () => {
    cy.visitWithStorage({
      sync: {
        preferences: {
          extensionEnabled: false,
        },
      },
    });

    s.layout.disabledBanner.root().should("be.visible");
  });

  it("should hide when clicking the re-enable button", () => {
    cy.visitWithStorage({
      sync: {
        preferences: {
          extensionEnabled: false,
        },
      },
    });

    s.layout.disabledBanner.enableButton().click();
    s.layout.disabledBanner.root().should("not.be.visible");
  });

  it("should hide when re-enabling the extension from the layout", () => {
    cy.visitWithStorage({
      sync: {
        preferences: {
          extensionEnabled: false,
        },
      },
    });

    s.layout.extensionEnabledToggleButton().click();
    s.layout.disabledBanner.root().should("not.be.visible");
  });
});
