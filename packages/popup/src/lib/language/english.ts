export default {
  api: {
    suggest: {
      GENERAL_ERROR: "Something went wrong generating your suggestions.",
      MISSING_DATA:
        "Your request was successful but the response is missing information.",
      USAGE_LIMIT_EXCEEDED:
        "You have exceeded your usage limit for this period. Check the Options page for more details.",
    },
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
