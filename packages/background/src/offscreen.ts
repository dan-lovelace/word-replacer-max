import { createWebAppMessage } from "@worm/shared";
import { browser } from "@worm/shared/src/browser";
import { Replacer } from "@worm/shared/src/replace/replacer";
import { WebAppMessageData, WebAppMessageKind } from "@worm/types/src/message";

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const event = message as WebAppMessageData<WebAppMessageKind>;

  switch (event.kind) {
    case "processReplacementsRequest": {
      const eventData =
        event as WebAppMessageData<"processReplacementsRequest">;

      const messages = eventData.details ?? [];
      const replacer = new Replacer(document, {
        rules: [
          {
            identifier: crypto.randomUUID(),
            isEnabled: true,
            queries: ["comments"],
            queryPatterns: [],
            replacements: ["replies", "thoughts"],
          },
          {
            identifier: crypto.randomUUID(),
            isEnabled: true,
            queries: ["hide"],
            queryPatterns: [],
            replacements: ["banish", "delete"],
          },
        ],
      });

      const results = replacer.handleMessages(messages);
      const responseMessage = createWebAppMessage(
        "processReplacementsResponse",
        {
          data: results,
        }
      );

      sendResponse(responseMessage);

      return true;
    }
  }
  return undefined;
});
