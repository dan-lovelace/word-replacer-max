import { browser } from "@worm/shared";

import { initializeContextMenu } from "./lib/context-menu";
import { initializeStorage } from "./lib/storage";

browser.runtime.onInstalled.addListener(async () => {
  initializeContextMenu();
  initializeStorage();
});
