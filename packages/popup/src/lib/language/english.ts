export default {
  account: {
    DANGER_ZONE_HEADING: "Danger Zone",
    DANGER_ZONE_DELETE_ACCOUNT_BUTTON_TEXT: "Delete account",
    DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_TITLE: "DELETE ACCOUNT",
    DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_BODY:
      "Are you sure you want to delete your account? This action cannot be undone and you will lose all your data. We recommend first backing up your rules using the export feature.",
    DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_CANCEL_BUTTON_TEXT:
      "No, keep my account",
    DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_INPUT_LABEL:
      "I understand that this action cannot be undone",
    DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_PROCEED_BUTTON_TEXT:
      "Delete my account forever",
    DANGER_ZONE_DELETE_ACCOUNT_HEADING: "Delete Account",
    DANGER_ZONE_DELETE_ACCOUNT_SUBHEADING:
      "Delete your account and all associated data. This action cannot be undone.",
    DANGER_ZONE_DELETE_RULES_BUTTON_TEXT: "Delete all rules",
    DANGER_ZONE_DELETE_RULES_CONFIRMATION_TITLE: "DELETE ALL RULES",
    DANGER_ZONE_DELETE_RULES_CONFIRMATION_BODY:
      "Are you sure you want to delete all your rules? This action cannot be undone. We recommend first backing up your rules using the export feature.",
    DANGER_ZONE_DELETE_RULES_CONFIRMATION_CANCEL_BUTTON_TEXT:
      "No, keep my rules",
    DANGER_ZONE_DELETE_RULES_CONFIRMATION_INPUT_LABEL:
      "I understand that this action cannot be undone",
    DANGER_ZONE_DELETE_RULES_HEADING: "Delete All Rules",
    DANGER_ZONE_DELETE_RULES_SUBHEADING:
      "Remove all your replacement rules while keeping your account intact.",
    DANGER_ZONE_DELETE_RULES_SUCCESS_MESSAGE: "Your rules have been deleted.",
    ACCOUNT_DETAILS_HEADING: "Account Details",
    ACCOUNT_DETAILS_EMAIL_LABEL: "Email",
    DELETE_ACCOUNT_API_RESPONSE_GENERAL_ERROR:
      "Something went wrong deleting your account.",
  },
  api: {
    account: {
      usage: {
        GENERAL_ERROR: "Something went wrong getting your usage",
      },
    },
    suggest: {
      GENERAL_ERROR: "Something went wrong generating your suggestions.",
      MISSING_DATA:
        "Your request was successful but the response is missing information.",
      USAGE_LIMIT_EXCEEDED:
        "You have exceeded your usage limit for this period. Check the Options page for more details.",
    },
  },
  auth: {
    TERMS_ACCEPTANCE_REQUIRED_MESSAGE: "Please review and accept our latest",
    TERMS_ACCEPTANCE_REQUIRED_LINK_TEXT: "Terms and Conditions",
    TERMS_ACCEPTANCE_ACCEPT_BUTTON_TEXT: "Accept",
    TERMS_ACCEPTANCE_GENERAL_ERROR_MESSAGE:
      "Something went wrong accepting terms",
  },
  domains: {
    ADD_DOMAIN_FORM_INPUT_PLACEHOLDER: "Enter a domain (e.g., example.com)",
    ADD_DOMAIN_FORM_SUBMIT_BUTTON_TEXT: "Add",
    ADD_CURRENT_DOMAIN_BUTTON_TEXT: "Add current site",
    DOMAINS_LIST_HEADING: "Domain List",
    EMPTY_DOMAINS_LIST_ALERT_TITLE: "No domains",
    EMPTY_DOMAINS_LIST_ALERT_BODY:
      "Text replacements are active on all websites. To limit replacements to specific sites, add them to your domains list.",
    LIST_EFFECT_ALLOWLIST_DESCRIPTION:
      "Word replacements will only work on the domains you list",
    LIST_EFFECT_ALLOWLIST_LABEL: "Only on listed domains",
    LIST_EFFECT_ALLOWLIST_NAME: "Allowlist",
    LIST_EFFECT_BLOCKLIST_DESCRIPTION:
      "Word replacements will work everywhere except the domains you list",
    LIST_EFFECT_BLOCKLIST_LABEL: "Everywhere except listed domains",
    LIST_EFFECT_BLOCKLIST_NAME: "Blocklist",
    REPLACEMENT_SCOPE_HEADING: "List Type",
    REPLACEMENT_SCOPE_SUB_HEADING:
      "Choose how you want to control which websites use your replacements.",
  },
  options: {
    CLIPBOARD_COPY_ERROR: "Unable to copy to clipboard.",
    CLIPBOARD_COPY_SUCCESS: "Copied to clipboard.",
    CORRUPTED_IMPORT_CONTENT: "It looks like your export file is corrupted.",
    DIRECT_UPLOAD_DISALLOWED:
      "We opened this tab for you because Firefox can't upload files directly into the extension's popup window. Feel free to import your files here and close this window when you're done.",
    FILE_IMPORT_SUCCESS: "Rules from file imported successfully.",
    GENERATE_SHARE_LINK_FAILED:
      "Something went wrong creating your share link.",
    INVALID_IMPORT_LINK:
      "Invalid import link. Check your URL format and try again.",
    LINK_EXPORT_SUCCESS: "Success! Your link is ready on the Options page.",
    LINK_IMPORT_SUCCESS: "Rules from link imported successfully.",
    POPUP_BLOCKED:
      "Unable to pop extension out. Please disable popup blockers for this page.",
  },
  rules: {
    EMPTY_RULES_LIST_ALERT_TITLE: "No rules",
    EMPTY_RULES_LIST_ALERT_BODY: "Create a rule to start replacing text again.",
    REFRESH_REQUIRED: "You must refresh the page to see these changes.",
  },
  support: {
    CONTACT_SUPPORT_FORM_EMPTY_MESSAGE_ERROR: "Message is required",
    CONTACT_SUPPORT_FORM_MESSAGE_INPUT_PLACEHOLDER:
      "Tell us what's on your mind – questions, suggestions, or anything else you'd like to share...",
    CONTACT_SUPPORT_FORM_SUBMIT_BUTTON_TEXT: "Send",
    CONTACT_SUPPORT_FORM_SUCCESS_MESSAGE:
      "Your message has been sent. We will get back to you soon!",
    CONTACT_SUPPORT_FORM_GENERAL_ERROR:
      "Something went wrong sending your message. Please try again.",
  },
};
