import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Plugin } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const rootDir = join(__dirname, "..", "..", "..");

export const envDir = join(rootDir, "config");
export const outDir = join(rootDir, "dist");

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
