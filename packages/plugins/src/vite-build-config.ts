import { Plugin } from "vite";

import { envDir, outDir } from ".";

export function buildConfig(): Plugin {
  return {
    name: "vite-build-config",
    config(_, envConfig) {
      return {
        build: {
          minify: envConfig.mode === "production",
          outDir,
        },
        envDir,
      };
    },
  };
}
