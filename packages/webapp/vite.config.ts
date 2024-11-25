import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { envDir, publicImagePreload } from "@worm/plugins";

export default defineConfig({
  build: {
    outDir: "./dist",
  },
  define: {
    global: "window",
  },
  envDir,
  plugins: [publicImagePreload(), react()],
});
