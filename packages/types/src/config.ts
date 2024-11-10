/// <reference types="vite/client" />

type OAuthResponseType = "code" | "token";

export const environments = ["development", "production"] as const;

/**
 * Deployment environments.
 */
export type Environment = (typeof environments)[number];

export type SsmAuthConfig = {
  readonly SSM_USER_POOL_HOSTED_UI_QUERY: string;
  readonly SSM_USER_POOL_CLIENT_ID: string;
  readonly SSM_USER_POOL_CUSTOM_DOMAIN: string;
  readonly SSM_USER_POOL_PROVIDER_URL: string;
  readonly SSM_USER_POOL_ID: string;
  readonly SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN: string;
  readonly SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT: string;
  readonly SSM_USER_POOL_OAUTH_RESPONSE_TYPE: OAuthResponseType;
  readonly SSM_USER_POOL_OAUTH_SCOPES: string[];
  readonly SSM_WEBAPP_ORIGIN: string;
};

export type ViteEnvConfig = {
  /**
   * Values from `.env` files.
   */
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;

  /**
   * Values pulled from SSM.
   */
  readonly VITE_SSM_USER_POOL_HOSTED_UI_QUERY?: string;
  readonly VITE_SSM_USER_POOL_CLIENT_ID?: string;
  readonly VITE_SSM_USER_POOL_CUSTOM_DOMAIN?: string;
  readonly VITE_SSM_USER_POOL_PROVIDER_URL?: string;
  readonly VITE_SSM_USER_POOL_ID?: string;
  readonly VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN?: string;
  readonly VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT?: string;
  readonly VITE_SSM_USER_POOL_OAUTH_RESPONSE_TYPE?: OAuthResponseType;
  readonly VITE_SSM_USER_POOL_OAUTH_SCOPES?: string[];
  readonly VITE_SSM_WEBAPP_ORIGIN?: string;
};
