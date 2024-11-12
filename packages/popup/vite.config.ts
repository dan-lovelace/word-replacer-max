import { join } from "node:path";

import { defineConfig, loadEnv, UserConfig } from "vite";

import preact from "@preact/preset-vite";

import { buildConfig } from "@worm/plugins";
import { POPUP_DEV_SERVER_PORT } from "@worm/testing/src/popup";

const productionConfig: UserConfig = {
  build: {
    assetsDir: "popup",
    rollupOptions: {
      input: "popup.html",
      output: {
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
  plugins: [buildConfig(), preact()],
};

const testConfig: UserConfig = {
  build: {
    rollupOptions: {
      input: "popup.html",
    },
  },
  plugins: [buildConfig(), preact()],
  resolve: {
    alias: [
      {
        find: "webextension-polyfill",
        replacement: join(__dirname, "..", "testing", "src", "test-browser.ts"),
      },
    ],
  },
  server: {
    port: POPUP_DEV_SERVER_PORT,
  },
};

const modeConfig: Record<string, UserConfig> = {
  development: productionConfig,
  production: productionConfig,
  test: testConfig,
};

export default defineConfig(({ mode }) => {
  if (process.env.VITE_MODE) {
    process.env = {
      ...process.env,
      ...loadEnv(process.env.VITE_MODE, process.cwd()),
    };
  }

  return modeConfig[mode] || modeConfig.production;
});
