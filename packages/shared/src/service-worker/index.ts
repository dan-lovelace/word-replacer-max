import { WebAppMessageData, WebAppMessageKind } from "@worm/types/src/message";

import { browser } from "../browser";
import { createWebAppMessage } from "../messaging";

import { ensureOffscreenDocument } from "./offscreen";

export const processReplacements = async (
  event: WebAppMessageData<"processReplacementsRequest">,
  sendResponse: (message: unknown) => void
) => {
  if (browser.runtime.getManifest().manifest_version === 3) {
    // process DOM in offscreen document
    await ensureOffscreenDocument();
    // console.log("offscreen document ready");

    const offscreenResponse = await browser.runtime.sendMessage<
      WebAppMessageData<"processReplacementsRequest">,
      WebAppMessageData<"processReplacementsResponse">
    >(createWebAppMessage("processReplacementsRequest"));

    sendResponse(offscreenResponse.details?.data);
  } else {
    // process DOM locally
    const element = document.createElement("div");
    console.log("element", element);

    const responseMessage = createWebAppMessage("processReplacementsResponse", {
      data: event.details,
    });
    console.log("sending response", responseMessage);
    sendResponse(responseMessage);
  }
};
