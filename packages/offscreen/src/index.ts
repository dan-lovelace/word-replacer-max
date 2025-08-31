import { createWebAppMessage } from "@worm/shared";
import { browser } from "@worm/shared/src/browser";
import { Replacer } from "@worm/shared/src/replace/replacer";
import { WebAppMessageData, WebAppMessageKind } from "@worm/types/src/message";

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const event = message as WebAppMessageData<WebAppMessageKind>;

  if (event.targets && !event.targets?.includes("offscreen")) {
    return;
  }

  switch (event.kind) {
    case "offscreenReadyRequest": {
      const responseMessage = createWebAppMessage("offscreenReadyResponse", {
        data: { success: true },
      });

      sendResponse(responseMessage);
      return true;
    }

    case "processReplacementsRequest": {
      const eventData =
        event as WebAppMessageData<"processReplacementsRequest">;

      const messages = eventData.details ?? [];
      const replacer = new Replacer(document, {
        // fake rules
        location: {
          effect: "deny",
          hrefs: [],
          useGlobalSettings: true,
        },
        rules: [
          {
            identifier: crypto.randomUUID(),
            isEnabled: true,
            mergeInlineElements: true,
            normalizeWhitespace: true,
            queries: ["comments"],
            queryPatterns: [],
            replacements: ["replies", "thoughts"],
            replacementStyle: {
              isBold: false,
            },
          },
          {
            identifier: crypto.randomUUID(),
            isEnabled: true,
            mergeInlineElements: true,
            normalizeWhitespace: true,
            queries: ["hide"],
            queryPatterns: [],
            replacements: ["banish", "delete"],
            replacementStyle: {
              isBold: false,
            },
          },
          {
            identifier: crypto.randomUUID(),
            isEnabled: true,
            mergeInlineElements: true,
            normalizeWhitespace: true,
            queries: ["lorem ipsum"],
            queryPatterns: [],
            replacements: ["sit"],
            replacementStyle: {
              isBold: false,
            },
          },
        ],
      });

      const results = replacer.handleMessages(messages);
      const responseMessage = createWebAppMessage(
        "processReplacementsResponse",
        { data: results }
      );

      sendResponse(responseMessage);
      return true;
    }
  }

  return undefined;
});
