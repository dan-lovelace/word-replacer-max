import { browser } from "@worm/shared/src/browser";
import { logDebug } from "@worm/shared/src/logging";

console.log("Offscreen script loaded");

async function init() {
  await new Promise(() =>
    setTimeout(() => {
      logDebug("done", browser.runtime);
    }, 2e3)
  );
}

init();
