import { assert } from "@web-extension/shared/src/assert";
import { matchersFromStorage } from "@web-extension/shared/src/browser/matchers";

import {
  generateMatchers,
  TEST_MATCHER_ID_1,
  TEST_MATCHER_ID_2,
} from "../../support/generators/rules";
import { selectors } from "../../support/selectors";

function openConfirmationModal() {
  selectors.options.ruleSync.toggleButton().click();

  // wait for modal transition to fully finish
  cy.wait(400);
}

describe("options page rule sync", () => {
  describe("toggle button", () => {
    it("should render enabled when saved as ON", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          ruleSync: {
            active: true,
          },
        },
      });

      selectors.options.ruleSync.toggleButton().should("be.checked");
    });

    it("should render disabled when saved as OFF", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          ruleSync: {
            active: false,
          },
        },
      });

      selectors.options.ruleSync.toggleButton().should("not.be.checked");
    });

    it("should open a warning dialog when clicking", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          ruleSync: {
            active: true,
          },
        },
      });

      selectors.options.ruleSync.toggleButton().click();

      selectors.options.ruleSync.modal.root().should("be.visible");
      cy.findByRole("heading", { name: /change storage type/i }).should(
        "be.visible"
      );
      cy.contains("You are switching from sync to local storage");
      selectors.options.ruleSync.modal.confirmationAlert().should("be.visible");
      selectors.options.ruleSync.modal.sharingTabButton().should("be.visible");
      selectors.options.ruleSync.modal
        .confirmationCheckbox()
        .should("be.visible")
        .should("not.be.checked");
      selectors.options.ruleSync.modal.cancelButton().should("be.visible");
      selectors.options.ruleSync.modal
        .proceedButton()
        .should("be.visible")
        .should("have.attr", "disabled");
    });
  });

  describe("confirmation modal", () => {
    beforeEach(() => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          ruleSync: {
            active: true,
          },
        },
      });

      openConfirmationModal();

      // make sure the toggle doesn't change before confirming
      selectors.options.ruleSync.toggleButton().should("be.checked");
    });

    it("should close the modal when clicking Cancel without confirming", () => {
      selectors.options.ruleSync.modal.cancelButton().click();

      selectors.options.ruleSync.modal.root().should("not.be.visible");
      selectors.options.ruleSync.toggleButton().should("be.checked");
    });

    it("should close the modal when clicking Cancel after confirming", () => {
      selectors.options.ruleSync.modal
        .confirmationCheckbox()
        .click()
        .should("be.checked");

      selectors.options.ruleSync.modal.cancelButton().click();

      selectors.options.ruleSync.modal.root().should("not.be.visible");
      selectors.options.ruleSync.toggleButton().should("be.checked");
    });

    it("should reset confirmation when clicking Cancel", () => {
      selectors.options.ruleSync.modal
        .confirmationCheckbox()
        .click()
        .should("be.checked");

      selectors.options.ruleSync.modal.cancelButton().click();
      selectors.options.ruleSync.toggleButton().click();

      selectors.options.ruleSync.modal
        .confirmationCheckbox()
        .should("not.be.checked");
      selectors.options.ruleSync.toggleButton().should("be.checked");
    });

    it("should close the modal when clicking X without confirming", () => {
      selectors.options.ruleSync.modal.closeButton().click();

      selectors.options.ruleSync.modal.root().should("not.be.visible");
      selectors.options.ruleSync.toggleButton().should("be.checked");
    });

    it("should close the modal when clicking X after confirming", () => {
      selectors.options.ruleSync.modal
        .confirmationCheckbox()
        .click()
        .should("be.checked");

      selectors.options.ruleSync.modal.closeButton().click();

      selectors.options.ruleSync.modal.root().should("not.be.visible");
      selectors.options.ruleSync.toggleButton().should("be.checked");
    });

    it("should reset confirmation when clicking X", () => {
      selectors.options.ruleSync.modal
        .confirmationCheckbox()
        .click()
        .should("be.checked");

      selectors.options.ruleSync.modal.closeButton().click();
      selectors.options.ruleSync.toggleButton().click();

      selectors.options.ruleSync.modal
        .confirmationCheckbox()
        .should("not.be.checked");
      selectors.options.ruleSync.toggleButton().should("be.checked");
    });

    it("should enable the Proceed button when confirming", () => {
      selectors.options.ruleSync.modal.confirmationCheckbox().click();

      selectors.options.ruleSync.modal
        .proceedButton()
        .should("not.have.attr", "disabled");
      selectors.options.ruleSync.toggleButton().should("be.checked");
    });

    it("should save the setting when confirming", () => {
      selectors.options.ruleSync.modal.confirmationCheckbox().click();
      selectors.options.ruleSync.modal.proceedButton().click();

      selectors.options.ruleSync.toggleButton().should("not.be.checked");
    });

    it("should confirm again when changing after saving", () => {
      selectors.options.ruleSync.modal.confirmationCheckbox().click();
      selectors.options.ruleSync.modal.proceedButton().click();

      selectors.options.ruleSync.modal.root().should("not.be.visible");

      openConfirmationModal();

      selectors.options.ruleSync.modal.root().should("be.visible");
      selectors.options.ruleSync.toggleButton().should("not.be.checked");
    });
  });

  describe("rule migration", () => {
    it("should migrate rules from sync to local", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          ruleSync: {
            active: true,
          },
        },
      });

      openConfirmationModal();
      selectors.options.ruleSync.modal.confirmationCheckbox().click();

      cy.getBrowser().then(async (browser) => {
        const localStorageBefore = await browser.storage.local?.get();
        const syncStorageBefore = await browser.storage.sync?.get();

        assert(localStorageBefore !== undefined);
        assert(syncStorageBefore !== undefined);

        const localMatchersBefore = matchersFromStorage(localStorageBefore);
        const syncMatchersBefore = matchersFromStorage(syncStorageBefore);

        expect(localMatchersBefore).to.eq(undefined);
        expect(syncMatchersBefore?.length).to.eq(2);

        // migration occurs on this button click
        selectors.options.ruleSync.modal.proceedButton().click();

        // wait for operation(s) to fully complete
        cy.wait(500).then(async () => {
          selectors.options.ruleSync.modal.root().should("not.be.visible");

          const localStorageAfter = await browser.storage.local?.get();
          const syncStorageAfter = await browser.storage.sync?.get();

          assert(localStorageAfter !== undefined);
          assert(syncStorageAfter !== undefined);

          const localMatchersAfter = matchersFromStorage(localStorageAfter);
          const syncMatchersAfter = matchersFromStorage(syncStorageAfter);

          expect(localMatchersAfter?.length).to.eq(2);
          expect(syncMatchersAfter).to.eq(undefined);
        });
      });
    });

    it("should migrate rules from local to sync", () => {
      cy.visitWithStorage({
        local: generateMatchers(),
        sync: {
          preferences: {
            activeTab: "options",
          },
          ruleSync: {
            active: false,
          },
        },
      });

      openConfirmationModal();
      selectors.options.ruleSync.modal.confirmationCheckbox().click();

      cy.getBrowser().then(async (browser) => {
        // NOTE: remove testing browser default matchers first
        await browser.storage.sync?.remove([
          TEST_MATCHER_ID_1,
          TEST_MATCHER_ID_2,
        ]);

        const localStorageBefore = await browser.storage.local?.get();
        const syncStorageBefore = await browser.storage.sync?.get();

        assert(localStorageBefore !== undefined);
        assert(syncStorageBefore !== undefined);

        const localMatchersBefore = matchersFromStorage(localStorageBefore);
        const syncMatchersBefore = matchersFromStorage(syncStorageBefore);

        expect(localMatchersBefore?.length).to.eq(2);
        expect(syncMatchersBefore).to.eq(undefined);

        // migration occurs on this button click
        selectors.options.ruleSync.modal.proceedButton().click();

        // wait for operation(s) to fully complete
        cy.wait(500).then(async () => {
          selectors.options.ruleSync.modal.root().should("not.be.visible");

          const localStorageAfter = await browser.storage.local?.get();
          const syncStorageAfter = await browser.storage.sync?.get();

          assert(localStorageAfter !== undefined);
          assert(syncStorageAfter !== undefined);

          const localMatchersAfter = matchersFromStorage(localStorageAfter);
          const syncMatchersAfter = matchersFromStorage(syncStorageAfter);

          expect(localMatchersAfter).to.eq(undefined);
          expect(syncMatchersAfter?.length).to.eq(2);
        });
      });
    });
  });
});
