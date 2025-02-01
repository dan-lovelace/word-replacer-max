export const selectors = {
  account: {
    container: () => cy.findByTestId("account-container"),
    dangerZone: {
      deleteAccountButton: () => cy.findByTestId("delete-account-button"),
      deleteAccountConfirmationAlert: () =>
        cy.findByTestId("delete-account-confirmation-alert"),
      deleteAccountConfirmationCancelButton: () =>
        cy.findByTestId("delete-account-confirmation-cancel-button"),
      deleteAccountConfirmationCheckbox: () =>
        cy.findByTestId("delete-account-confirmation-checkbox"),
      deleteAccountConfirmationContainer: () =>
        cy.findByTestId("delete-account-confirmation-container"),
      deleteAccountContainer: () => cy.findByTestId("delete-account-container"),
      deleteAllRulesButton: () => cy.findByTestId("delete-all-rules-button"),
      deleteAllRulesConfirmationAlert: () =>
        cy.findByTestId("delete-all-rules-confirmation-alert"),
      deleteAllRulesConfirmationCancelButton: () =>
        cy.findByTestId("delete-all-rules-confirmation-cancel-button"),
      deleteAllRulesConfirmationCheckbox: () =>
        cy.findByTestId("delete-all-rules-confirmation-checkbox"),
      deleteAllRulesConfirmationContainer: () =>
        cy.findByTestId("delete-all-rules-confirmation-container"),
      deleteAllRulesConfirmationSubmitButton: () =>
        cy.findByTestId("delete-all-rules-confirmation-submit-button"),
      deleteAllRulesContainer: () =>
        cy.findByTestId("delete-all-rules-container"),
      root: () => cy.findByTestId("danger-zone"),
    },
  },
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
  layout: {
    accountDropdownAccountButton: () =>
      cy.findByTestId("account-dropdown-account-button"),
    accountDropdownButton: () => cy.findByTestId("account-dropdown-button"),
    accountDropdownSignedInEmail: () =>
      cy.findByTestId("account-dropdown-signed-in-email"),
    accountDropdownSignedInMenuContainer: () =>
      cy.findByTestId("account-dropdown-signed-in-menu-container"),
    accountDropdownSignedInMenuHeading: () =>
      cy.findByTestId("account-dropdown-signed-in-menu-heading"),
    accountDropdownSignedOutContainer: () =>
      cy.findByTestId("account-dropdown-signed-out-container"),
    accountDropdownSignedOutMenuContainer: () =>
      cy.findByTestId("account-dropdown-signed-out-menu-container"),
    accountDropdownSignOutButton: () =>
      cy.findByTestId("account-dropdown-sign-out-button"),
    disabledBanner: {
      enableButton: () => cy.findByTestId("enable-button"),
      root: () => cy.findByTestId("disabled-banner"),
    },
    extensionEnabledToggleButton: () =>
      cy.findByTestId("extension-enabled-toggle-button"),
    tabs: {
      domains: () => cy.findByTestId("domains-tab"),
      options: () => cy.findByTestId("options-tab"),
      rules: () => cy.findByTestId("rules-tab"),
      support: () => cy.findByTestId("support-tab"),
    },
  },
  optionsTab: () => cy.findByTestId("options-tab"),
  options: {
    replacementSuggest: {
      apiUsage: {
        refillAlertMessage: () => cy.findByTestId("refill-alert-message"),
        root: () => cy.findByTestId("api-usage"),
      },
      toggleButton: () =>
        cy.findByTestId("replacement-suggestions-toggle-button"),
    },
    ruleGroups: {
      inputWrapper: () => cy.findByTestId("rule-groups-input-wrapper"),
      toggleButton: () => cy.findByTestId("rule-groups-toggle-button"),
    },
    rulesImport: {
      input: () => cy.findByTestId("file-input__input"),
      label: () => cy.findByTestId("file-input__label"),
      uploadRedirect: () => cy.findByTestId("file-input__upload-redirect"),
    },
  },
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
  ruleGroups: {
    manageModal: {
      addGroupButton: () => cy.findByTestId("add-group-button"),
      deleteGroupButton: () => cy.findByTestId("delete-group-button"),
      nameInput: () => cy.findByTestId("name-input"),
      ruleGroupRows: () => cy.findAllByTestId("rule-group-row"),
    },
    toolbar: {
      modalToggleButton: () => cy.findByTestId("rule-groups-button"),
      root: () => cy.findByTestId("rule-groups-toolbar"),
    },
  },
  ruleRows: () => cy.findAllByTestId("rule-row"),
  ruleRowsFirst: () => selectors.ruleRows().first(),
  rules: {
    list: {
      emptyRulesListAlert: () => cy.findByTestId("empty-rules-list-alert"),
      replacementInput: () => cy.findByTestId("replacement-text-input"),
    },
    queryInput: {
      chips: () => cy.findAllByTestId("query-input__chip"),
      input: () => cy.findByTestId("query-input__input"),
      root: () => cy.findByTestId("query-input"),
    },
    replacementSuggest: {
      dropdownMenu: {
        configuration: () => cy.findByTestId("suggestions-configuration"),
        resultsItems: () => cy.findAllByTestId("suggestions-list-item"),
        resultsList: () => cy.findByTestId("suggestions-list"),
        resultsListSpinner: () => cy.findByTestId("suggestions-list-spinner"),
        resultsTone: () => cy.findByTestId("suggestions-tone-label"),
        root: () => cy.findByTestId("suggestions-dropdown-menu"),
        submitButton: () => cy.findByTestId("generate-suggestions-button"),
        toneSelectInput: () => cy.findByTestId("tone-select"),
        toneSelectOption: () => cy.findByTestId("tone-option"),
      },
      dropdownToggle: () => cy.findByTestId("suggestions-dropdown-toggle"),
    },
    ruleGroups: {
      includedGroupsList: () => cy.findByTestId("included-groups-list"),
      groupColors: () => cy.findAllByTestId("rule-group-color"),
      groupTooltips: () => cy.findAllByTestId("rule-group-tooltip"),
      removeFromGroupButtons: () =>
        cy.findAllByTestId("remove-from-group-button"),
    },
  },
  support: {
    contactSupportForm: () => cy.findByTestId("contact-support-form"),
    contactSupportFormMessageError: () =>
      cy.findByTestId("contact-support-form-message-error"),
    contactSupportFormMessageInput: () =>
      cy.findByTestId("contact-support-form-message-input"),
    contactSupportFormSubmitButton: () =>
      cy.findByTestId("contact-support-form-submit-button"),
    loggedInContactOptions: () => cy.findByTestId("logged-in-contact-options"),
    loggedOutContactOptions: () =>
      cy.findByTestId("logged-out-contact-options"),
  },
  tooltip: {
    container: () => cy.get(".tooltip.bs-tooltip-auto"),
    inner: () => selectors.tooltip.container().get(".tooltip-inner"),
  },
};
