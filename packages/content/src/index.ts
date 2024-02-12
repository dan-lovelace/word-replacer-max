import { renderContent, startContentListeners } from "./lib";

document.addEventListener("readystatechange", () => {
  renderContent("document state change");
});

startContentListeners();
