Cypress.Commands.add("getBrowser", () => {
  cy.window().then((win) => {
    cy.wrap(win.CYPRESS_BROWSER).as("browser");
  });
});
