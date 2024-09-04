import { runStorageMigrations } from "@worm/shared";

import { renderContent, startContentListeners } from "./lib";

document.addEventListener("readystatechange", () => {
  renderContent("document state change");
});

runStorageMigrations();
startContentListeners();
