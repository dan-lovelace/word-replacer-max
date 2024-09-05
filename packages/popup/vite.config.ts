import { join } from "path";

import preact from "@preact/preset-vite";
import { defineConfig, loadEnv, UserConfig } from "vite";

const rootDir = join(__dirname, "..", "..");

const envDir = join(rootDir, "config");
const outDir = join(rootDir, "dist");

const modeConfig: Record<string, UserConfig> = {
  test: {
    envDir,
    build: {
      rollupOptions: {
        input: "popup.html",
      },
    },
    plugins: [preact()],
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
    envDir,
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
    plugins: [preact()],
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
