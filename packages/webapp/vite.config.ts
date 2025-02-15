import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import { envDir } from "@worm/plugins";

export default defineConfig({
  build: {
    outDir: "./dist",
  },
  define: {
    global: "window",
  },
  envDir,
  plugins: [react()],
});
