Cypress.Commands.add("getBrowser", () => {
  cy.window().then((win) => {
    cy.wrap(win.TEST_BROWSER).as("browser");
  });
});
