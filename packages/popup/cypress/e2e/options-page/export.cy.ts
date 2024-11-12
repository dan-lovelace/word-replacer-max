import path from "node:path";

import { ENDPOINTS } from "../../support/endpoints";
import { selectors as s } from "../../support/selectors";

const { exportModal } = s;

const MODAL_WAIT_PERIOD_MS = 500;

describe("export", () => {
  beforeEach(() => {
    cy.visitWithStorage();
    s.optionsTab().click();
  });

  it("should open the export modal when clicking the export button", () => {
    s.exportButton().click();
    exportModal.modal().should("be.visible");
  });

  it("should open the export modal dropdown menu when clicking the dropdown button", () => {
    s.exportButton().click();
    exportModal.dropdownButton().click();
    exportModal.dropdownMenu().should("be.visible");
  });

  it("should close the export modal dropdown menu when clicking the cancel button", () => {
    s.exportButton().click();
    cy.wait(MODAL_WAIT_PERIOD_MS);

    exportModal.cancelButton().should("be.visible").click();
    exportModal.modal().should("not.be.visible");
  });

  it("should generate export links", () => {
    cy.intercept(ENDPOINTS.SHARE).as("share");

    s.exportButton().click();
    cy.wait(MODAL_WAIT_PERIOD_MS);

    exportModal.dropdownButton().click();
    exportModal.dropdownMenuCreateLinkButton().click();
    exportModal.modal().should("not.be.visible");

    cy.wait("@share").then(({ response }) => {
      /**
       * Tests for backwards compatibility. This may be removed later.
       */
      const responseData = response?.body.data.value
        ? response?.body.data.value
        : response?.body.data;

      cy.wrap(responseData).should("have.property", "url");

      exportModal
        .exportLinks()
        .should("be.visible")
        .within(() => {
          cy.get("input").should("have.value", responseData.url);
        });
    });
  });

  it("should download file exports", () => {
    const time = new Date(2024, 1, 1);
    const downloadsFolder = Cypress.config("downloadsFolder");

    cy.clock(time);

    s.exportButton().click();
    cy.wait(MODAL_WAIT_PERIOD_MS);

    exportModal.dropdownButton().click();
    exportModal.dropdownMenuCreateFileButton().click();
    exportModal.modal().should("not.be.visible");

    cy.readFile(
      path.join(downloadsFolder, `WordReplacerMax_Rules_${time.getTime()}.json`)
    );
  });
});
