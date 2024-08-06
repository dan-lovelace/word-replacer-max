import { join } from "path";

import preact from "@preact/preset-vite";
import { defineConfig, UserConfig } from "vite";

const outDir = join(__dirname, "..", "..", "dist");

const modeConfig: Record<string, UserConfig> = {
  test: {
    plugins: [preact()],
    build: {
      rollupOptions: {
        input: "popup.html",
      },
    },
    resolve: {
      alias: [
        {
          find: "webextension-polyfill",
          replacement: join(
            __dirname,
            "..",
            "testing",
            "src",
            "test-browser.ts"
          ),
        },
      ],
    },
  },
  production: {
    plugins: [preact()],
    build: {
      assetsDir: "popup",
      minify: true,
      outDir,
      rollupOptions: {
        input: "popup.html",
        output: {
          chunkFileNames: "[name].js",
          assetFileNames: "[name].[ext]",
        },
      },
    },
  },
};

export default defineConfig(
  ({ mode }) => modeConfig[mode] || modeConfig.production
);
