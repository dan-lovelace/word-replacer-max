import { systemColors } from "@worm/shared/src/replace/lib/style";
import { SyncStorage } from "@worm/types/src/storage";

import { selectors as s } from "../../support/selectors";

const { colorSelect, replacementStyles } = s;

describe("styled replacements", () => {
  describe("option toggle", () => {
    beforeEach(() => {
      cy.visitWithStorage();
      s.optionsTab().click();
    });

    it("should not show options when disabled", () => {
      replacementStyles.inputWrapper().should("be.visible");
      replacementStyles.description().should("be.visible");
      replacementStyles.options().should("not.be.visible");
    });

    it("should show options when enabled", () => {
      replacementStyles.toggleButton().click();

      replacementStyles.description().should("not.be.visible");
      replacementStyles.options().should("be.visible");

      replacementStyles.textDecorators.wrapper().should("be.visible");
      replacementStyles.textDecorators.boldInput().should("be.visible");
      replacementStyles.textDecorators.italicInput().should("be.visible");
      replacementStyles.textDecorators.underlineInput().should("be.visible");
      replacementStyles.textDecorators
        .strikethroughInput()
        .should("be.visible");

      replacementStyles.colorInputs
        .wrapper()
        .should("be.visible")
        .within(() => {
          replacementStyles.colorInputs
            .backgroundColorCheckbox()
            .should("be.visible")
            .should("be.checked");
          replacementStyles.colorInputs
            .backgroundColorColorInput()
            .should("be.visible");

          replacementStyles.colorInputs
            .colorCheckbox()
            .should("be.visible")
            .should("not.be.checked");
          replacementStyles.colorInputs
            .colorColorInput()
            .should("not.be.visible");
        });
    });

    it("should hide options when changing from enabled to disabled", () => {
      replacementStyles.toggleButton().click();
      replacementStyles.options().should("be.visible");

      replacementStyles.toggleButton().click();
      replacementStyles.description().should("be.visible");
      replacementStyles.options().should("not.be.visible");
    });
  });

  describe("style settings", () => {
    it("allows user to enable text decorators", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          replacementStyle: {
            active: true,
            options: ["backgroundColor"],
          },
        },
      });
      replacementStyles.textDecorators.boldButton().click();
      replacementStyles.textDecorators.boldInput().should("be.checked");

      cy.getBrowser().then((browser) => {
        browser.storage?.sync?.get().then((storage) => {
          cy.wrap((storage as SyncStorage).replacementStyle?.options).should(
            "include",
            "bold"
          );
        });
      });
    });

    it("allows user to disable text decorators", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          replacementStyle: {
            active: true,
            options: ["backgroundColor", "bold"],
          },
        },
      });
      replacementStyles.textDecorators.boldButton().click();
      replacementStyles.textDecorators.boldInput().should("not.be.checked");

      cy.getBrowser().then((browser) => {
        browser.storage?.sync?.get().then((storage) => {
          cy.wrap((storage as SyncStorage).replacementStyle?.options).should(
            "not.include",
            "bold"
          );
        });
      });
    });

    it("allows user to enable colors", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          replacementStyle: {
            active: true,
            options: ["backgroundColor"],
          },
        },
      });
      replacementStyles.colorInputs.colorCheckbox().click();
      replacementStyles.colorInputs.colorColorInput().should("be.visible");

      cy.getBrowser().then((browser) => {
        browser.storage?.sync?.get().then((storage) => {
          cy.wrap((storage as SyncStorage).replacementStyle?.options).should(
            "include",
            "color"
          );
        });
      });
    });

    it("allows user to disable colors", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          replacementStyle: {
            active: true,
            options: ["backgroundColor"],
          },
        },
      });
      replacementStyles.colorInputs.backgroundColorCheckbox().click();
      replacementStyles.colorInputs
        .backgroundColorColorInput()
        .should("not.be.visible");

      cy.getBrowser().then((browser) => {
        browser.storage?.sync?.get().then((storage) => {
          cy.wrap((storage as SyncStorage).replacementStyle?.options).should(
            "not.include",
            "backgroundColor"
          );
        });
      });
    });

    it("allows user to choose a system color", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          replacementStyle: {
            active: true,
            options: ["backgroundColor"],
          },
        },
      });

      replacementStyles.colorInputs.backgroundColorColorInput().within(() => {
        colorSelect.dropdownButton().click();
        colorSelect.dropdownMenu().should("be.visible");

        colorSelect.dropdownMenuOptions().then((allOptions) => {
          for (const option of allOptions as unknown as HTMLElement[]) {
            cy.wrap(option).should("be.visible");
          }
        });

        colorSelect.dropdownMenuOptions().first().click();

        colorSelect
          .customInput()
          .invoke("val")
          .then((customInputValue) => {
            cy.wrap(customInputValue).should("eq", systemColors.blueGray);
          });
      });

      cy.getBrowser().then((browser) => {
        browser.storage?.sync?.get().then((storage) => {
          cy.wrap(
            (storage as SyncStorage).replacementStyle?.backgroundColor
          ).should("eq", systemColors.blueGray);
        });
      });
    });

    it("allows user to choose a custom color", () => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
          replacementStyle: {
            active: true,
            options: ["backgroundColor"],
          },
        },
      });

      const testColor = "#000000";

      replacementStyles.colorInputs.backgroundColorColorInput().within(() => {
        colorSelect.customInput().clear().type(testColor).blur();

        colorSelect
          .customInput()
          .invoke("val")
          .then((customInputValue) => {
            cy.wrap(customInputValue).should("eq", testColor);
          });
      });

      cy.getBrowser().then((browser) => {
        browser.storage?.sync?.get().then((storage) => {
          cy.wrap(
            (storage as SyncStorage).replacementStyle?.backgroundColor
          ).should("eq", testColor);
        });
      });
    });
  });
});
