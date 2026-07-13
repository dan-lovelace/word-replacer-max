/// <reference types="vite/client" />

export const environments = ["development", "production", "test"] as const;

/**
 * Deployment environments.
 */
export type Environment = (typeof environments)[number];

export type SsmAuthConfig = {
  readonly SSM_WEBAPP_ORIGIN: string;
};

export type ViteEnvConfig = {
  /**
   * Values from `.env` files.
   */
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_COPYRIGHT_YEAR?: string;
  readonly VITE_EXTENSION_STORE_URL_CHROME?: string;
  readonly VITE_EXTENSION_STORE_URL_EDGE?: string;
  readonly VITE_EXTENSION_STORE_URL_FIREFOX?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;

  /**
   * Values pulled from SSM.
   */
  readonly VITE_SSM_WEBAPP_ORIGIN?: string;
};
