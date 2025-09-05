export const selectors = {
  body: () => cy.findByTestId("body"),
  head: () => cy.findByTestId("head"),
  html: () => cy.findByTestId("html"),
  replacedText: () => cy.get("[data-is-replaced]"),
  script: () => cy.findByTestId("script"),
  style: () => cy.findByTestId("style"),
  target: () => cy.findByTestId("target"),
  title: () => cy.findByTestId("title"),
};
