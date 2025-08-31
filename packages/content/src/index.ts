import "@worm/shared/vite-env.d.ts";

import { browser, Renderer } from "@worm/shared/src/browser";
import {
  WebExtensionReplacer,
} from "@worm/shared/src/replace/extension-replacer";
import { runStorageMigrations } from "@worm/shared/src/storage";

runStorageMigrations();

// new Renderer(browser, document.documentElement);

const replacer = new WebExtensionReplacer(browser, document);

replacer.start();
