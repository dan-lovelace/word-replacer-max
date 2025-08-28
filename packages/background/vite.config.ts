import { defineConfig } from "vite";

import { buildConfig } from "@worm/plugins";

export default defineConfig({
  build: {
    rollupOptions: {
      input: ["src/index.ts", "offscreen.html"],
      output: {
        entryFileNames: (chunk) => {
          switch (chunk.name) {
            case "index":
              return "background.js";

            default:
              return `[name].js`;
          }
        },
      },
    },
  },
  plugins: [buildConfig()],
});
