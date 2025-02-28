import "@worm/shared/vite-env.d.ts";

import { runStorageMigrations } from "@worm/shared/src/storage";

import { IngestionEngine } from "./lib/ingestion";
import { startContentListeners } from "./lib/listeners";
import { renderContent } from "./lib/render";

const MODE_ENABLED = true;

function main() {
  if (MODE_ENABLED) {
    new IngestionEngine();
  } else {
    /**
     * Back up mechanism to ensure legacy function is maintained during
     * development of the new.
     */
    document.addEventListener("readystatechange", () => {
      renderContent("document state change");
    });

    runStorageMigrations();
    startContentListeners();
  }
}

main();
