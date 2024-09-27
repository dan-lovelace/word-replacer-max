import { defineConfig } from "vite";

import { authConfig, buildConfig } from "@worm/plugins";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "src/index.ts",
      output: {
        entryFileNames: "background.js",
      },
    },
  },
  plugins: [buildConfig(), authConfig()],
});
