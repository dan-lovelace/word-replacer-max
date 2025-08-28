import { WebAppMessageData, WebAppMessageKind } from "@worm/types/src/message";

import { browser } from "../browser";
import { createWebAppMessage } from "../messaging";

import { ensureOffscreenDocument } from "./offscreen";

export async function processReplacements(
  event: WebAppMessageData<WebAppMessageKind>,
  sendResponse: (message: unknown) => void
) {
  if (browser.runtime.getManifest().manifest_version === 3) {
    // process DOM in offscreen document
    await ensureOffscreenDocument();
    console.log("offscreen document ready");
  } else {
    // process DOM locally
    const element = document.createElement("div");
    console.log("element", element);
  }

  const responseMessage = createWebAppMessage("processReplacementsResponse", {
    data: { foo: "bar" },
  });
  console.log("sending response", responseMessage);
  sendResponse(responseMessage);
}
