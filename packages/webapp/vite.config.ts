import { join } from "path";

import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

const rootDir = join(__dirname, "..", "..");

export default defineConfig({
  define: {
    global: "window",
  },
  envDir: join(rootDir, "config"),
  plugins: [preact()],
});
