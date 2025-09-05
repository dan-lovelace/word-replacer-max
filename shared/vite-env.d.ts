/// <reference types="vite/client" />

import { ViteEnvConfig } from "@wordreplacermax/types/src/config";

interface ImportMetaEnv extends ViteEnvConfig {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
