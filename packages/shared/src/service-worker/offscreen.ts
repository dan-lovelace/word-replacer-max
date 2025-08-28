export async function ensureOffscreenDocument() {
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["DOM_PARSER" as chrome.offscreen.Reason],
      justification: "Continuous DOM processing for website mutations",
    });
  } catch (error) {
    if (!(error instanceof Error)) throw error;

    if (!error.message.startsWith("Only a single offscreen")) {
      throw error;
    }
  }
}
