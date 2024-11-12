import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "cypress";
import { loadEnv } from "vite";

import { envDir } from "@worm/plugins";

const publicEnv = loadEnv("test", envDir);

/**
 * Create the file `cypress/.env.private` and populate it with necessary
 * values.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const privateEnv = loadEnv("private", path.join(__dirname, "cypress"));

export default defineConfig({
  e2e: {
    setupNodeEvents(on, cypressConfig) {
      const newConfig = Object.assign({}, cypressConfig);

      newConfig.env = {
        ...newConfig.env,
        ...publicEnv,
        ...privateEnv,
      };

      return newConfig;
    },
  },
});
