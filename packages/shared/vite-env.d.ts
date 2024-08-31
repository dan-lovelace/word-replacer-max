/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALLOWED_CONTENT_ORIGINS: string[];
  readonly VITE_API_ORIGIN: string;
  readonly VITE_SIGN_IN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
