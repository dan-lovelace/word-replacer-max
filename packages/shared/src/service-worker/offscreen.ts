let offscreenDocumentCreated = false;

export async function ensureOffscreenDocument() {
  try {
    /**
     * Notice the `chrome` namespace is referenced instead of the polyfilled
     * `browser`. This is because offscreen documents are only supported in MV3
     * environments.
     */
    if (
      Object.prototype.hasOwnProperty.call(window, "chrome") ||
      chrome === undefined
    ) {
      throw new Error(
        "Chrome namespace not found. Unable to create offscreen document."
      );
    }

    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT" as chrome.runtime.ContextType],
    });

    if (existingContexts.length > 0) {
      offscreenDocumentCreated = true;
      return;
    }

    if (!offscreenDocumentCreated) {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["DOM_PARSER" as chrome.offscreen.Reason],
        justification: "Continuous DOM processing for website mutations",
      });
      offscreenDocumentCreated = true;
      console.log("Offscreen document created");
    }
  } catch (error) {
    console.error("Error ensuring offscreen document:", error);
    offscreenDocumentCreated = false;
    throw error;
  }
}
