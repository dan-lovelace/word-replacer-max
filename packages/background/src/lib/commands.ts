import { browser } from "@worm/shared/src/browser";
import { BrowserCommand } from "@worm/shared/src/browser/commands";

export function startCommandsListener() {
  browser.commands.onCommand.addListener((command) => {
    const casted = command as BrowserCommand | undefined;

    switch (casted) {
      case "input-replacement": {
        console.log("TODO: send replacement request to content script");
        break;
      }
    }
  });
}
