import { selectors } from "../../support/selectors";

describe("domain input", () => {
  beforeEach(() => {
    cy.visitWithStorage({
      sync: {
        preferences: {
          activeTab: "domains",
        },
      },
    });
  });

  it("should trim input when adding a new domain", () => {
    selectors.domains.addDomainInput().type("   example1.com").blur();
    selectors.domains.addDomainInput().type("example2.com   ").blur();
    selectors.domains.addDomainInput().type("   example3.com   ").blur();

    cy.getBrowser().then(async (browser) => {
      const allStorage = await browser.storage.sync?.get();

      cy.wrap(allStorage?.domainList).should("contain", "example1.com");
      cy.wrap(allStorage?.domainList).should("contain", "example2.com");
      cy.wrap(allStorage?.domainList).should("contain", "example3.com");
    });
  });

  it("should format input when adding a new domain", () => {
    selectors.domains.addDomainInput().type("http://example1.com").blur();
    selectors.domains.addDomainInput().type("http://www.example2.com").blur();
    selectors.domains.addDomainInput().type("https://example3.com").blur();
    selectors.domains.addDomainInput().type("https://example4.so").blur();
    selectors.domains
      .addDomainInput()
      .type("https://sub.domain.example5.com")
      .blur();
    selectors.domains
      .addDomainInput()
      .type("https://example6.com/lorem/ipsum?search=sit")
      .blur();

    cy.getBrowser().then(async (browser) => {
      const allStorage = await browser.storage.sync?.get();

      cy.wrap(allStorage?.domainList).should("contain", "example1.com");
      cy.wrap(allStorage?.domainList).should("contain", "www.example2.com");
      cy.wrap(allStorage?.domainList).should("contain", "example3.com");
      cy.wrap(allStorage?.domainList).should("contain", "example4.so");
      cy.wrap(allStorage?.domainList).should(
        "contain",
        "sub.domain.example5.com"
      );
      cy.wrap(allStorage?.domainList).should("contain", "example6.com");
    });
  });

  it("should not add invalid domains", () => {
    const invalidDomain = "example1-.com";

    selectors.domains.addDomainInput().type(invalidDomain).blur();

    cy.contains(/invalid domain. check your input and try again./i);

    cy.getBrowser().then(async (browser) => {
      const allStorage = await browser.storage.sync?.get();

      cy.wrap(allStorage?.domainList).should("not.contain", invalidDomain);
    });
  });

  it("should show a warning with allow mode selected", () => {
    selectors.domains.allowRadioButton().click();

    selectors.domains.allowAlert().should("be.visible");
  });

  it("should not show a warning with deny mode selected", () => {
    selectors.domains.allowRadioButton().click();
    selectors.domains.denyRadioButton().click();

    selectors.domains.allowAlert().should("not.be.visible");
  });
});
