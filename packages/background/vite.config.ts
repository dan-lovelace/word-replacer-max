import { defineConfig } from "vite";

import { buildConfig } from "@worm/plugins";
import { getManifestVersion } from "@worm/shared/src/config/manifest";

export default defineConfig(() => {
  if (getManifestVersion() === 2) {
    /**
     * Silently exit since Manifest v2 builds do not require this package. The
     * service worker is instead included in the offscreen package's HTML page.
     */
    process.exit(0);
  }

  return {
    build: {
      rollupOptions: {
        input: "src/index.ts",
        output: {
          entryFileNames: "background.js",
        },
      },
    },
    plugins: [buildConfig()],
  };
});
