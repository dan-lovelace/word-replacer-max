Cypress.Commands.add("getBrowser", () => {
  cy.window().then((win) => {
    cy.wrap(win.DEV_BROWSER).as("browser");
  });
});
