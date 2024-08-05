export const selectors = {
  addNewRuleButton: () => cy.findByTestId("add-new-rule-button"),
  homePage: () => cy.findByTestId("home-page"),
  ruleRowFirst: () => selectors.ruleRows().first(),
  ruleRows: () => cy.findAllByTestId("rule-row"),
};
