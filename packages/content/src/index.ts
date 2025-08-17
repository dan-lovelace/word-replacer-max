import "@worm/shared/vite-env.d.ts";

import { browser, Renderer } from "@worm/shared/src/browser";
import { runStorageMigrations } from "@worm/shared/src/storage";

runStorageMigrations();

new Renderer(browser, document.documentElement);
