import "@worm/shared/vite-env.d.ts";

import { browser, Renderer } from "@worm/shared/src/browser";
import { runStorageMigrations } from "@worm/shared/src/storage";
import { WebAppMessageData, WebAppMessageKind } from "@worm/types/src/message";

runStorageMigrations();

const renderer = new Renderer(browser, document.documentElement);

browser.runtime.onMessage.addListener((message) => {
  const event = message as WebAppMessageData<WebAppMessageKind>;

  if (event.kind === "inputReplacementRequest") {
    renderer.replaceInputElements();
  }

  return undefined;
});
