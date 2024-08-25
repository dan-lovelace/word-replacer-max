import { basename, dirname, join } from "path";

import { defineConfig } from "vite";

const rootDir = join(__dirname, "..", "..");

const envDir = join(rootDir, "config");
const outDir = join(rootDir, "dist");

export default defineConfig(({ mode }) => ({
  build: {
    minify: mode === "production",
    outDir,
    rollupOptions: {
      input: ["src/index.ts"],
      output: {
        assetFileNames: "[name].[ext]",
        chunkFileNames: "[name].js",
        entryFileNames: (chunkInfo) => {
          switch (chunkInfo.name) {
            case "index":
              /**
               * Use the packge name for `main.tsx`.
               */
              return "content.js";
            default:
              /**
               * Use the input's parent directory name for everything else and
               * put it into the `assets/js` directory so we don't need to
               * maintain the manifest's `web_accessible_resources`.
               */
              return join(
                "assets",
                "js",
                `${basename(
                  dirname(chunkInfo.facadeModuleId ?? "content-chunk")
                )}.js`
              );
          }
        },
      },
    },
  },
  envDir,
}));
