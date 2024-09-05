import {
  createWebAppMessage,
  getWebAppIFrame,
  logDebug,
  webAppMessages,
} from "@worm/shared";
import { storageSetByKeys } from "@worm/shared/src/storage";
import {
  ApiAuthTokensResponse,
  WebAppMessage,
  WebAppMessageKind,
} from "@worm/types";

/**
 * Attempt to communicate with the running `webapp` package in whichever
 * environment the extension is deployed. Communication is done through an
 * iframe rendered in the webapp DOM using the `window.postMessage` API.
 *
 * Polling is used to look for the expected `iframe` element in the webapp DOM.
 * When found, a message is posted to its window by the content script letting
 * the webapp know it is ready for messages.
 */
export function initializeWebApp() {
  const initializationStarted = new Date().getTime();
  const initializationLengthMs = 10000;
  const initializationIntervalMs = 50;

  const initialization: ReturnType<typeof setInterval> = setInterval(() => {
    if (new Date().getTime() - initializationStarted > initializationLengthMs) {
      logDebug("Timeout initializing web app");
      return clearInterval(initialization);
    }

    const elementQuery = getWebAppIFrame();

    if (!elementQuery || !elementQuery.contentWindow) return;

    elementQuery.contentWindow.addEventListener(
      "message",
      (event: WebAppMessage<WebAppMessageKind>) => {
        switch (event.data.kind) {
          case webAppMessages.AUTH_TOKENS: {
            storageSetByKeys({
              authentication: {
                tokens: event.data.details as ApiAuthTokensResponse,
              },
            });
            break;
          }

          case webAppMessages.PING_REQUEST: {
            const latestElement = getWebAppIFrame();
            const pingResponse = latestElement !== undefined;
            const pingResponseMessage = createWebAppMessage(
              webAppMessages.PING_RESPONSE,
              pingResponse
            );

            if (!latestElement || !latestElement.contentWindow) {
              logDebug(
                "Unable to locate iframe content window when responding to ping"
              );
              break;
            }

            latestElement.contentWindow.postMessage(pingResponseMessage);
            break;
          }

          default:
        }
      }
    );

    const newMessage = createWebAppMessage(
      webAppMessages.CONTENT_INITIALIZE,
      true
    );
    elementQuery.contentWindow.postMessage(newMessage);

    clearInterval(initialization);
  }, initializationIntervalMs);
}
