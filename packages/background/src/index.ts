import { browser } from "@worm/shared";

import {
  initializeContextMenu,
  startContextMenuListener,
} from "./lib/context-menu";
import { initializeStorage } from "./lib/storage";

browser.runtime.onInstalled.addListener(async () => {
  initializeContextMenu();
  initializeStorage();
});

startContextMenuListener();
