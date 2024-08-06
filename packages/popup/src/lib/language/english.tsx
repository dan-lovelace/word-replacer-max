import HelpRedirect from "../../components/HelpRedirect";

export default {
  rules: {
    REFRESH_REQUIRED: "You must refresh the page to see these changes.",
  },
  options: {
    CORRUPTED_IMPORT_CONTENT: (
      <>
        It looks like your export file is corrupted. Please <HelpRedirect />.
      </>
    ),
    DIRECT_UPLOAD_DISALLOWED:
      "We opened this tab for you because Firefox can't upload files directly into the extension's popup window. Feel free to import your files here and close this window when you're done.",
    INVALID_IMPORT_LINK:
      "Invalid import link. Check your URL format and try again.",
    POPUP_BLOCKED:
      "Unable to pop extension out. Please disable popup blockers for this page.",
  },
};
