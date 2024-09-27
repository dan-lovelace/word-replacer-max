import { join } from "node:path";

import preact from "@preact/preset-vite";
import { defineConfig, loadEnv, UserConfig } from "vite";

import { authConfig, buildConfig } from "@worm/plugins";

const testConfig: UserConfig = {
  build: {
    rollupOptions: {
      input: "popup.html",
    },
  },
  plugins: [authConfig(), buildConfig(), preact()],
  resolve: {
    alias: [
      {
        find: "webextension-polyfill",
        replacement: join(__dirname, "..", "testing", "src", "test-browser.ts"),
      },
    ],
  },
};

const modeConfig: Record<string, UserConfig> = {
  development: testConfig,
  production: {
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
    plugins: [authConfig(), buildConfig(), preact()],
  },
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
