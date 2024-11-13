export const selectors = {
  addNewRuleButton: () => cy.findByTestId("add-new-rule-button"),
  colorSelect: {
    dropdownButton: () => cy.findByTestId("color-select-dropdown-button"),
    dropdownMenu: () => cy.findByTestId("color-select-dropdown-menu"),
    dropdownMenuOptions: () =>
      cy.findAllByTestId("color-select-dropdown-menu-option"),
    customInput: () => cy.findByTestId("color-select-custom-input"),
    wrapper: () => cy.findByTestId("color-select"),
  },
  exportButton: () => cy.findAllByTestId("export-button"),
  exportModal: {
    modal: () => cy.findByTestId("export-modal"),
    cancelButton: () => cy.findByTestId("export-modal-cancel-button"),
    dropdownButton: () => cy.findByTestId("export-modal-dropdown-button"),
    dropdownMenu: () => cy.findByTestId("export-modal-dropdown-menu"),
    dropdownMenuCreateFileButton: () =>
      cy.findByTestId("export-modal-dropdown-menu-create-file-button"),
    dropdownMenuCreateLinkButton: () =>
      cy.findByTestId("export-modal-dropdown-menu-create-link-button"),
    exportLinks: () => cy.findByTestId("export-links"),
  },
  homePage: () => cy.findByTestId("home-page"),
  optionsTab: () => cy.findByTestId("options-tab"),
  replacementStyles: {
    colorInputs: {
      backgroundColorCheckbox: () =>
        cy.findByTestId("color-input-checkbox-backgroundColor"),
      backgroundColorColorInput: () =>
        cy.findByTestId("color-input-color-select-backgroundColor"),
      colorCheckbox: () => cy.findByTestId("color-input-checkbox-color"),
      colorColorInput: () => cy.findByTestId("color-input-color-select-color"),
      wrapper: () => cy.findByTestId("replacement-styles-color-inputs"),
    },
    description: () => cy.findByTestId("replacement-styles-description"),
    inputWrapper: () => cy.findByTestId("replacement-styles-input-wrapper"),
    options: () => cy.findByTestId("replacement-styles-options"),
    textDecorators: {
      boldButton: () => cy.get("input[name='bold'] + label"),
      boldInput: () => cy.get("input[name='bold']"),
      italicButton: () => cy.get("input[name='italic'] + label"),
      italicInput: () => cy.get("input[name='italic']"),
      underlineButton: () => cy.get("input[name='underline'] + label"),
      underlineInput: () => cy.get("input[name='underline']"),
      strikethroughButton: () => cy.get("input[name='strikethrough'] + label"),
      strikethroughInput: () => cy.get("input[name='strikethrough']"),
      wrapper: () => cy.findByTestId("text-decorators"),
    },
    toggleButton: () => cy.findByTestId("replacement-styles-toggle-button"),
  },
  ruleRows: () => cy.findAllByTestId("rule-row"),
  ruleRowsFirst: () => selectors.ruleRows().first(),
  rules: {
    list: {
      replacementInput: () => cy.findByTestId("replacement-text-input"),
    },
    replacementSuggest: {
      dropdownMenu: {
        configuration: () => cy.findByTestId("suggestions-configuration"),
        resultsItems: () => cy.findAllByTestId("suggestions-list-item"),
        resultsList: () => cy.findByTestId("suggestions-list"),
        resultsTone: () => cy.findByTestId("suggestions-tone-label"),
        root: () => cy.findByTestId("suggestions-dropdown-menu"),
        submitButton: () => cy.findByTestId("generate-suggestions-button"),
        toneSelectInput: () => cy.findByTestId("tone-select"),
        toneSelectOption: () => cy.findByTestId("tone-option"),
      },
      dropdownToggle: () => cy.findByTestId("suggestions-dropdown-toggle"),
    },
  },
};
