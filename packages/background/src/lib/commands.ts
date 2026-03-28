import { browser } from "@worm/shared/src/browser";

export function startCommandsListener() {
  browser.commands.onCommand.addListener((command) => {
    console.log("command", command);
  });
}
