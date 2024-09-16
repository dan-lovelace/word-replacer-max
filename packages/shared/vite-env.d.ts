/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALLOWED_CONTENT_ORIGINS?: string[];
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_COGNITO_HOSTED_UI_QUERY?: string;
  readonly VITE_COGNITO_USER_POOL_CLIENT_ID?: string;
  readonly VITE_COGNITO_USER_POOL_CUSTOM_DOMAIN?: string;
  readonly VITE_COGNITO_USER_POOL_ENDPOINT?: string;
  readonly VITE_COGNITO_USER_POOL_ID?: string;
  readonly VITE_WEBAPP_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
