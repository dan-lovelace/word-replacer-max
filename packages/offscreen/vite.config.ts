import { defineConfig } from "vite";

import { buildConfig } from "@worm/plugins";

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
