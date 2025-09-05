import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Plugin } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const rootDir = join(__dirname, "..", "..", "..", "..");

const findTranslations = (directory: string): string[] => {
  const translationFiles: string[] = [];

  try {
    const entries = readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        const subFiles = findTranslations(fullPath);

        translationFiles.push(...subFiles);
      } else if (entry.isFile() && entry.name === "messages.json") {
        translationFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Could not read directory ${directory}:`, error);
  }

  return translationFiles;
};

export const envDir = join(rootDir, "config");
export const outDir = join(rootDir, "dist");

export function buildConfig(): Plugin {
  return {
    name: "vite-build-config",

    config: (_, envConfig) => ({
      build: {
        minify: envConfig.mode === "production",
        outDir,
      },
      envDir,
    }),
  };
}

export function i18nHotReload(): Plugin {
  return {
    name: "i18n-hot-reload",
    async buildStart() {
      const localesDir = join(
        rootDir,
        "packages",
        "web-extension",
        "content",
        "public",
        "_locales"
      );
      const messageFiles = findTranslations(localesDir);

      for (const file of messageFiles) {
        this.addWatchFile(file);
      }
    },
  };
}
