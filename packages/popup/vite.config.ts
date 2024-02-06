import { basename, dirname, join } from "path";

import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

const outDir = join(__dirname, "..", "..", "dist");

export default defineConfig(({ mode }) => ({
  plugins: [preact()],
  build: {
    assetsDir: "popup",
    minify: mode === "production",
    outDir,
    rollupOptions: {
      input: "popup.html",
      output: {
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
}));
