import { defineConfig } from "vite";

import { buildConfig } from "@web-extension/plugins";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "offscreen.html",
      output: {
        entryFileNames: "offscreen.js",
      },
    },
  },
  plugins: [buildConfig()],
});
