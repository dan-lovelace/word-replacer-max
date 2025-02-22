import { browser } from "@worm/shared/src/browser";
import { initializeServiceWorker } from "@worm/shared/src/browser/service-worker";

initializeServiceWorker();

const manifestVersion = browser.runtime.getManifest().manifest_version;

if (manifestVersion === 3) {
  // @ts-ignore
  browser.offscreen.createDocument({
    url: "offscreen-mv3.html",
    reasons: ["DOM_PARSER"],
    justification: "To parse DOM contents in the background",
  });
}
