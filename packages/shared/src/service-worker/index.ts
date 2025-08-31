import { Replacer } from "@worm/shared/src/replace/replacer";
import {
  ReplacementMessageItem,
  WebAppMessageData,
} from "@worm/types/src/message";

import { browser } from "../browser";
import { createWebAppMessage } from "../messaging";

import { setupOffscreenDocument } from "./offscreen";

export const processReplacements = async (
  event: WebAppMessageData<"processReplacementsRequest">,
  sendResponse: (message: ReplacementMessageItem[] | undefined) => void
) => {
  if (browser.runtime.getManifest().manifest_version === 3) {
    // can only parse DOM in offscreen document
    await setupOffscreenDocument();

    const offscreenMessage = createWebAppMessage(
      "processReplacementsRequest",
      event.details,
      ["offscreen"]
    );
    const offscreenResponse = await browser.runtime.sendMessage<
      WebAppMessageData<"processReplacementsRequest">,
      WebAppMessageData<"processReplacementsResponse">
    >(offscreenMessage);

    sendResponse(offscreenResponse.details?.data);
  } else {
    // can parse DOM locally
    const replacer = new Replacer(document, {
      // fake rules
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

    const results = replacer.handleMessages(event.details ?? []);
    const responseMessage = createWebAppMessage("processReplacementsResponse", {
      data: results,
    });

    sendResponse(responseMessage.details?.data);
  }
};
