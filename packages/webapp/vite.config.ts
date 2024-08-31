import { join } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = join(__dirname, "..", "..");

export default defineConfig({
  define: {
    global: "window",
  },
  envDir: join(rootDir, "config"),
  plugins: [react()],
});
