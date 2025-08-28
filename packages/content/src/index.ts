import "@worm/shared/vite-env.d.ts";

import { browser, Renderer } from "@worm/shared/src/browser";
import { Replacer } from "@worm/shared/src/replace/replacer";
import { runStorageMigrations } from "@worm/shared/src/storage";

runStorageMigrations();

// new Renderer(browser, document.documentElement);

const replacer = new Replacer(browser, document);

replacer.start();
