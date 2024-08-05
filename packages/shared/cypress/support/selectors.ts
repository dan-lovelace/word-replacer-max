export const selectors = {
  body: () => cy.findByTestId("body"),
  head: () => cy.findByTestId("head"),
  html: () => cy.findByTestId("html"),
  script: () => cy.findByTestId("script"),
  target: () => cy.findByTestId("target"),
  title: () => cy.findByTestId("title"),
};
