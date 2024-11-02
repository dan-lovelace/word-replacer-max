export default {
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
  domains: {
    ADD_DOMAIN_FORM_INPUT_PLACEHOLDER: "Enter a domain (e.g., example.com)",
    ADD_DOMAIN_FORM_SUBMIT_BUTTON_TEXT: "Add",
    EMPTY_DOMAINS_LIST_ALERT_TITLE: "No domains",
    EMPTY_DOMAINS_LIST_ALERT_BODY:
      "Replacements are working for every website you visit.",
    LIST_EFFECT_ALLOWLIST_DESCRIPTION:
      "Word replacements will only work on these domains:",
    LIST_EFFECT_ALLOWLIST_LABEL: "Only apply to listed domains",
    LIST_EFFECT_ALLOWLIST_NAME: "Allowlist",
    LIST_EFFECT_BLOCKLIST_DESCRIPTION:
      "Word replacements will work everywhere except these domains:",
    LIST_EFFECT_BLOCKLIST_LABEL: "Apply to all websites except listed domains",
    LIST_EFFECT_BLOCKLIST_NAME: "Blocklist",
    LIST_EFFECT_QUESTION: "How should domains be applied?",
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
    REFRESH_REQUIRED: "You must refresh the page to see these changes.",
  },
};
