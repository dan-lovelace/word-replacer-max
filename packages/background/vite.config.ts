import { join } from "path";

import { defineConfig } from "vite";

const rootDir = join(__dirname, "..", "..");

const envDir = join(rootDir, "config");
const outDir = join(rootDir, "dist");

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
  envDir,
}));
