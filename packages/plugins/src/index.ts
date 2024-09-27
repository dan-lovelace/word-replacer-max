import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const rootDir = join(__dirname, "..", "..", "..");

export const envDir = join(rootDir, "config");
export const outDir = join(rootDir, "dist");

export function configureNodeEnvironment(nodeEnv: string) {
  config({ path: join(envDir, ".env") });
  config({ path: join(envDir, `.env.${nodeEnv}`) });
}

export * from "./vite-auth-config";
export * from "./vite-build-config";
