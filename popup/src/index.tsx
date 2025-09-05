import { ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { browser } from "@web-extension/shared/src/browser";

import renderPreact from "./_preact-app";
import App from "./App";

browser.storage.local.get("isV1Enabled").then((result) => {
  if (result.isV1Enabled === true) {
    const root = createRoot(document.getElementById("app") as HTMLElement);

    root.render((<App />) as ReactNode);
  } else {
    renderPreact();
  }
});
