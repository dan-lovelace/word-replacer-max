import { runStorageMigrations } from "@worm/shared/src/storage";
import "@worm/shared/vite-env.d.ts";

import { startContentListeners } from "./lib/listeners";
import { renderContent } from "./lib/render";

document.addEventListener("readystatechange", () => {
  renderContent("document state change");
});

runStorageMigrations();
startContentListeners();
