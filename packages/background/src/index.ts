import { browser } from "@worm/shared/src/browser";

import {
  initializeContextMenu,
  startContextMenuListener,
} from "./lib/context-menu";
import { initializeStorage } from "./lib/storage";

/**
 * From the documentation:
 *
 * Fired when the extension is first installed, when the extension is updated
 * to a new version, and when the browser is updated to a new version.
 */
browser.runtime.onInstalled.addListener(async () => {
  initializeContextMenu();
  initializeStorage();
});

startContextMenuListener();
