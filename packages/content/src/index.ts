import "@worm/shared/vite-env.d.ts";

import { browser } from "@worm/shared/src/browser";
import { Replacer } from "@worm/shared/src/browser/replacer";
import { runStorageMigrations } from "@worm/shared/src/storage";

// import { startContentListeners } from "./lib/listeners";
import { renderContent } from "./lib/render";

document.addEventListener("readystatechange", () => {
  renderContent("document state change");
});

new Replacer({
  startNode: document.documentElement,
  storageConfig: {
    backgroundPort: browser.runtime.connect({ name: "content" }),
    ttlMs: 20,
  },
});

runStorageMigrations();
// startContentListeners();
