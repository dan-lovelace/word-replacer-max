import {
  createWebAppMessage,
  getWebAppIFrame,
  logDebug,
} from "@web-extension/shared";
import { browser } from "@web-extension/shared/src/browser";
import {
  WebAppMessage,
  WebAppMessageKind,
} from "@wordreplacermax/types/src/message";

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
  const initializationIntervalMs = 25;

  const initializationPoll: NodeJS.Timeout = setInterval(() => {
    if (new Date().getTime() - initializationStarted > initializationLengthMs) {
      logDebug("Timeout initializing web app connection");
      return clearInterval(initializationPoll);
    }

    const elementQuery = getWebAppIFrame();

    if (!elementQuery || !elementQuery.contentWindow) return;

    /**
     * Listen for messages from the background script and pass them to the
     * webapp iframe. This one passes `event` as an argument to `postMessage`
     * because the iframe's content window handler's callback type must match.
     * The global `MessageEvent` type is extended to add custom properties to
     * the `data` attribute so we cannot pass `event.data` directly.
     *
     * @remarks
     * Review the webapp's iframe content window message listener for more
     * details.
     */
    browser.runtime.onMessage.addListener((message) => {
      const event = message as WebAppMessage<WebAppMessageKind>;
      const latestElement = getWebAppIFrame();

      latestElement?.contentWindow?.postMessage(event);

      return undefined;
    });

    /**
     * Listen for messages from the webapp iframe and pass them to the
     * background script. This passes `event.data` because `MessageEvent`
     * objects cannot be cloned so we must only pass the data.
     */
    elementQuery.contentWindow.addEventListener(
      "message",
      (event: WebAppMessage<WebAppMessageKind>) => {
        browser.runtime.sendMessage(event.data);
      }
    );

    const newMessage = createWebAppMessage("contentInitialize");
    elementQuery.contentWindow.postMessage(newMessage);

    clearInterval(initializationPoll);
  }, initializationIntervalMs);
}
