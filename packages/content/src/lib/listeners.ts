import { debounce, logDebug } from "@worm/shared";
import { browser, sendConnectMessage } from "@worm/shared/src/browser";
import { storageGetByKeys } from "@worm/shared/src/storage";
import {
  ErrorableMessage,
  HTMLReplaceResponse,
  WebAppMessageData,
  WebAppMessageKind,
} from "@worm/types/src/message";

import { renderContent } from "./render";

const render = debounce(renderContent, 20);

export function startContentListeners() {
  /**
   * Re-render whenever storage changes.
   */
  browser.storage.onChanged.addListener(() => renderContent());

  /**
   * Listen for changes to the document and render when they occur.
   */
  const observer = new MutationObserver((mutationList) => {
    const hasTextChanges = mutationList.some(
      (mutation) =>
        mutation.type === "characterData" ||
        Array.from(mutation.addedNodes).some(
          (node) => node.nodeType === Node.TEXT_NODE || node.hasChildNodes()
        )
    );

    if (hasTextChanges) {
      render("mutation");
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  /**
   * Listen for runtime messages.
   */
  browser.runtime.onMessage.addListener((message) => {
    const event = message as WebAppMessageData<WebAppMessageKind>;

    if (event.targets !== undefined && !event.targets.includes("content")) {
      return;
    }

    switch (event.kind) {
      case "htmlReplaceResponse": {
        const { data, error } =
          event.details as ErrorableMessage<HTMLReplaceResponse>;

        console.log("replace response data", data);

        // TODO: apply dom mutations from response
        // TODO: make sure large amounts of mutations do not block

        break;
      }
    }

    return undefined;
  });

  storageGetByKeys()
    .then((syncStorage) => {
      // TODO: send initial strings for replacement

      sendConnectMessage(
        "content",
        "htmlReplaceRequest",
        {
          strings: [
            {
              html: "<div>hello</div>",
              id: crypto.randomUUID(),
            },
            {
              html: "<div>world</div>",
              id: crypto.randomUUID(),
            },
          ],
          syncStorage,
        },
        ["background"]
      );
    })
    .catch((error) => {
      logDebug("Failed to initialize storage in content script", error);
    });
}
