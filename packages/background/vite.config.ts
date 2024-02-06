import { join } from "path";

import { defineConfig } from "vite";

const outDir = join(__dirname, "..", "..", "dist");

export default defineConfig(({ mode }) => ({
  build: {
    minify: mode === "production",
    outDir,
    rollupOptions: {
      input: "src/index.ts",
      output: {
        entryFileNames: "background.js",
      },
    },
  },
}));
