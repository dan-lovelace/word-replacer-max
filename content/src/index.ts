import "@web-extension/shared/vite-env.d.ts";

import { browser, Renderer } from "@web-extension/shared/src/browser";
import { WebExtensionReplacer } from "@web-extension/shared/src/replace/extension-replacer";
import { runStorageMigrations } from "@web-extension/shared/src/storage";

runStorageMigrations();

// new Renderer(browser, document.documentElement);

const replacer = new WebExtensionReplacer(browser, document);

replacer.start();
