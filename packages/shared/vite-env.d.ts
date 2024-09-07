/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALLOWED_CONTENT_ORIGINS: string[];
  readonly VITE_API_ORIGIN: string;
  readonly VITE_OAUTH_URL_HOST: string;
  readonly VITE_OAUTH_URL_QUERY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
