import { createWebAppMessage, logDebug } from "@worm/shared";
import { browser } from "@worm/shared/src/browser";
import { BrowserCommand } from "@worm/shared/src/browser/commands";
import { syncStorageProvider } from "@worm/shared/src/storage";
import { SyncStorage } from "@worm/types/src/storage";

export function startCommandsListener() {
  browser.commands.onCommand.addListener(async (command) => {
    const casted = command as BrowserCommand | undefined;

    const { preferences } = (await syncStorageProvider.get([
      "preferences",
    ])) as SyncStorage;

    if (!preferences || preferences.extensionEnabled !== true) {
      return;
    }

    switch (casted) {
      case "input-replacement": {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab?.id) {
          logDebug("Unable to locate active tab for input replacement");
          break;
        }

        browser.tabs.sendMessage(
          tab.id,
          createWebAppMessage("inputReplacementRequest")
        );

        break;
      }
    }
  });
}
