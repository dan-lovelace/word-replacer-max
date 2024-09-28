/// <reference types="vite/client" />

import { ViteEnvConfig } from "@worm/types/src/config";

interface ImportMetaEnv extends ViteEnvConfig {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
