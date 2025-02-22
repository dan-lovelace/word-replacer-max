import { join } from "node:path";

import { defineConfig } from "vite";

import { buildConfig } from "@worm/plugins";
import { getManifestVersion } from "@worm/shared/src/config/manifest";

const assetsDir = join("assets", "offscreen");

export default defineConfig(() => ({
  build: {
    assetsDir,
    rollupOptions: {
      input:
        getManifestVersion() === 2
          ? "offscreen-mv2.html"
          : "offscreen-mv3.html",
    },
  },
  plugins: [buildConfig()],
}));
