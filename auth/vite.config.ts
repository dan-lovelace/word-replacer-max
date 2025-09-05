import { defineConfig } from "vite";

import { buildConfig } from "@web-extension/plugins";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "src/index.ts",
      output: {
        entryFileNames: "auth.js",
      },
    },
  },
  plugins: [buildConfig()],
});
