import { isWebAppMessagingAllowed } from "@worm/shared";
import "@worm/shared/vite-env.d.ts";

import { startContentListeners } from "./lib/listeners";
import { renderContent } from "./lib/render";
import { initializeWebApp } from "./lib/webapp";

document.addEventListener("readystatechange", () => {
  renderContent("document state change");
});

startContentListeners();

if (isWebAppMessagingAllowed(window.location.hostname)) {
  initializeWebApp();
}
