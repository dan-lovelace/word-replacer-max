/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_SSM_USER_POOL_HOSTED_UI_QUERY?: string;
  readonly VITE_SSM_USER_POOL_CLIENT_ID?: string;
  readonly VITE_SSM_USER_POOL_CUSTOM_DOMAIN?: string;
  readonly VITE_SSM_USER_POOL_PROVIDER_URL?: string;
  readonly VITE_SSM_USER_POOL_ID?: string;
  readonly VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN?: string;
  readonly VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT?: string;
  readonly VITE_SSM_USER_POOL_OAUTH_RESPONSE_TYPE?: "code" | "token";
  readonly VITE_SSM_USER_POOL_OAUTH_SCOPES?: string[];
  readonly VITE_SSM_WEBAPP_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
