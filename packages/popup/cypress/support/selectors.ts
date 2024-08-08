export const selectors = {
  addNewRuleButton: () => cy.findByTestId("add-new-rule-button"),
  exportButton: () => cy.findAllByTestId("export-button"),
  exportModal: {
    modal: () => cy.findByTestId("export-modal"),
    cancelButton: () => cy.findByTestId("export-modal-cancel-button"),
    dropdownButton: () => cy.findByTestId("export-modal-dropdown-button"),
    dropdownMenu: () => cy.findByTestId("export-modal-dropdown-menu"),
    dropdownMenuCreateLinkButton: () =>
      cy.findByTestId("export-modal-dropdown-menu-create-link-button"),
    dropdownMenuCreateFileButton: () =>
      cy.findByTestId("export-modal-dropdown-menu-create-file-button"),
    exportLinks: () => cy.findByTestId("export-links"),
  },
  homePage: () => cy.findByTestId("home-page"),
  optionsTab: () => cy.findByTestId("options-tab"),
  ruleRows: () => cy.findAllByTestId("rule-row"),
  ruleRowsFirst: () => selectors.ruleRows().first(),
};
