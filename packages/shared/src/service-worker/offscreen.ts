import { createWebAppMessage } from "../messaging";

let creating: Promise<void> | null; // global promise to avoid concurrency issues

export function setupOffscreenDocument(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    /**
     * Repeatedly sends a ready request to the offscreen page until a message
     * is successfully sent. We don't care if or when it responds, just that
     * sending messages to it does not throw an error. This satisfies its
     * readiness enough at this point.
     *
     * Polling is used instead of waiting for a response because the whole need
     * for this arose from sending messages too early. The fastest way to
     * proceed is to only wait long enough for a handshake.
     */
    const sendReadyRequest = () => {
      const readyRequest = createWebAppMessage(
        "offscreenReadyRequest",
        undefined,
        ["offscreen"]
      );

      const started = Date.now();
      const maxWaitMs = 6000;

      const messagePoll = setInterval(() => {
        const now = Date.now();

        if (now - started >= maxWaitMs) {
          reject(new Error("Timeout waiting for offscreen ready check"));
        }

        chrome.runtime
          .sendMessage({ data: readyRequest })
          .then(() => {
            clearInterval(messagePoll);
            resolve();
          })
          .catch(() => {
            // silently ignore any errors while polling
          });
      }, 2);
    };

    const offscreenPath = "offscreen.html";
    const offscreenUrl = chrome.runtime.getURL(offscreenPath);

    try {
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [offscreenUrl],
      });

      if (existingContexts.length > 0) {
        // document exists but it may not be ready for messages yet
        sendReadyRequest();
        return;
      }

      // create document if it doesn't exist
      if (creating) {
        await creating;
      } else {
        creating = chrome.offscreen.createDocument({
          url: offscreenPath,
          reasons: [chrome.offscreen.Reason.DOM_PARSER],
          justification: "Parsing DOM contents for text replacement",
        });

        await creating;
        creating = null;
      }

      // cocument finished creating but may not be ready for messages
      sendReadyRequest();
    } catch (error) {
      reject(error);
    }
  });
}
