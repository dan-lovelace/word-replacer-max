import { interceptApiUsage } from "../../support/interceptors/api-usage";
import { selectors } from "../../support/selectors";

describe("api usage", () => {
  describe("for replacement suggest", () => {
    beforeEach(() => {
      cy.visitWithStorage({
        sync: {
          preferences: {
            activeTab: "options",
          },
        },
      });

      cy.appUserLogin();
    });

    it("should not display when feature is disabled", () => {
      selectors.optionsTab().click();

      selectors.options.replacementSuggest.apiUsage.root().should("not.exist");
    });

    it("should display when feature is enabled", () => {
      interceptApiUsage();

      selectors.options.replacementSuggest.toggleButton().click();

      cy.wait("@apiUsageResult").then(() => {
        selectors.options.replacementSuggest.apiUsage
          .root()
          .should("be.visible");
      });
    });

    it("should display refill message when approaching limit", () => {
      interceptApiUsage({
        "POST:suggest": {
          count: 48,
        },
      });

      selectors.options.replacementSuggest.toggleButton().click();

      cy.wait("@apiUsageResult").then(() => {
        selectors.options.replacementSuggest.apiUsage
          .refillAlertMessage()
          .should("be.visible");
      });
    });
  });
});
