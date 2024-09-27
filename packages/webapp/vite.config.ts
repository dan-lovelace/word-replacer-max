import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { authConfig, envDir } from "@worm/plugins";

export default defineConfig({
  build: {
    outDir: "./dist",
  },
  define: {
    global: "window",
  },
  envDir,
  plugins: [authConfig(), react()],
});
