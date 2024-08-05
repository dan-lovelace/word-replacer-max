export const selectors = {
  addNewRuleButton: () => cy.findByTestId("add-new-rule-button"),
  homePage: () => cy.findByTestId("home-page"),
  ruleRows: () => cy.findAllByTestId("rule-row"),
};
