import path from "path";

import { ENDPOINTS } from "../support/endpoints";
import { selectors as s, selectors } from "../support/selectors";

const { exportModal } = selectors;

const MODAL_WAIT_PERIOD_MS = 500;

describe("tab", () => {
  beforeEach(() => {
    cy.visitWithStorage();
    s.optionsTab().click();
  });

  describe("export", () => {
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
        cy.wrap(response?.body.data.value).should("have.property", "url");

        exportModal
          .exportLinks()
          .should("be.visible")
          .within(() => {
            cy.get("input").should("have.value", response?.body.data.value.url);
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
        path.join(
          downloadsFolder,
          `WordReplacerMax_Rules_${time.getTime()}.json`
        )
      );
    });
  });
});
