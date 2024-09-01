import {
  renderContent,
  runStorageMigrations,
  startContentListeners,
} from "./lib";

document.addEventListener("readystatechange", () => {
  renderContent("document state change");
});

runStorageMigrations();
startContentListeners();
