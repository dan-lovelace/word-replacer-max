import {
  createWebAppMessage,
  getWebAppIFrame,
  logDebug,
  webAppMessages,
} from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api/endpoints";
import {
  WebAppMessage,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { ApiAuthTokensResponse } from "@worm/types";

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
      async (event: WebAppMessage<WebAppMessageKind>) => {
        switch (event.data.kind) {
          case webAppMessages.AUTH_TOKENS: {
            const { data } = event.data.details as ApiAuthTokensResponse;
            const endpoint = getApiEndpoint("AUTH_WHOAMI");
            const response = await fetch(endpoint, {
              headers: {
                Authorization: `Bearer ${data?.accessToken}`,
                "Content-Type": "application/json",
              },
              method: "GET",
            });

            if (!response.ok) {
              sendWebAppMessage("showToastMessage", {
                message: "Authorization failed",
                options: {
                  severity: "danger",
                },
              });
            } else {
              sendWebAppMessage("showToastMessage", {
                message: "Login success",
                options: {
                  severity: "success",
                },
              });

              storageSetByKeys({
                authentication: {
                  tokens: event.data.details as ApiAuthTokensResponse,
                },
              });
            }

            break;
          }

          case webAppMessages.PING_REQUEST: {
            const latestElement = getWebAppIFrame();

            if (!latestElement || !latestElement.contentWindow) {
              logDebug(
                "Unable to locate iframe content window when responding to ping"
              );
              break;
            }

            sendWebAppMessage(webAppMessages.PING_RESPONSE, true);
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

export function sendWebAppMessage<T extends WebAppMessageKind>(
  kind: T,
  details?: WebAppMessageKindMap[T]
) {
  const latestElement = getWebAppIFrame();

  if (!latestElement || !latestElement.contentWindow) {
    return false;
  }

  const newMessage = createWebAppMessage(kind, details);
  latestElement.contentWindow.postMessage(newMessage);

  return true;
}
