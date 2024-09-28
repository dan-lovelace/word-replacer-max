import { ViteEnvConfig } from "@worm/types/src/config";

function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

export function getEnvConfig(): Required<ViteEnvConfig> {
  assert(import.meta.env.VITE_API_ORIGIN, "VITE_API_ORIGIN is required");
  assert(
    import.meta.env.VITE_SSM_USER_POOL_HOSTED_UI_QUERY,
    "VITE_SSM_USER_POOL_HOSTED_UI_QUERY is required"
  );
  assert(
    import.meta.env.VITE_SSM_USER_POOL_CLIENT_ID,
    "VITE_SSM_USER_POOL_CLIENT_ID is required"
  );
  assert(
    import.meta.env.VITE_SSM_USER_POOL_CUSTOM_DOMAIN,
    "VITE_SSM_USER_POOL_CUSTOM_DOMAIN is required"
  );
  assert(
    import.meta.env.VITE_SSM_USER_POOL_PROVIDER_URL,
    "VITE_SSM_USER_POOL_PROVIDER_URL is required"
  );
  assert(
    import.meta.env.VITE_SSM_USER_POOL_ID,
    "VITE_SSM_USER_POOL_ID is required"
  );
  assert(
    import.meta.env.VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN,
    "VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN is required"
  );
  assert(
    import.meta.env.VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT,
    "VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT is required"
  );
  assert(
    import.meta.env.VITE_SSM_USER_POOL_OAUTH_RESPONSE_TYPE,
    "VITE_SSM_USER_POOL_OAUTH_RESPONSE_TYPE is required"
  );
  assert(
    import.meta.env.VITE_SSM_USER_POOL_OAUTH_SCOPES,
    "VITE_SSM_USER_POOL_OAUTH_SCOPES is required"
  );
  assert(
    import.meta.env.VITE_SSM_WEBAPP_ORIGIN,
    "VITE_SSM_WEBAPP_ORIGIN is required"
  );

  return {
    VITE_API_ORIGIN: import.meta.env.VITE_API_ORIGIN,
    VITE_SSM_USER_POOL_HOSTED_UI_QUERY: import.meta.env
      .VITE_SSM_USER_POOL_HOSTED_UI_QUERY,
    VITE_SSM_USER_POOL_CLIENT_ID: import.meta.env.VITE_SSM_USER_POOL_CLIENT_ID,
    VITE_SSM_USER_POOL_CUSTOM_DOMAIN: import.meta.env
      .VITE_SSM_USER_POOL_CUSTOM_DOMAIN,
    VITE_SSM_USER_POOL_PROVIDER_URL: import.meta.env
      .VITE_SSM_USER_POOL_PROVIDER_URL,
    VITE_SSM_USER_POOL_ID: import.meta.env.VITE_SSM_USER_POOL_ID,
    VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN: import.meta.env
      .VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN,
    VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT: import.meta.env
      .VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT,
    VITE_SSM_USER_POOL_OAUTH_RESPONSE_TYPE: import.meta.env
      .VITE_SSM_USER_POOL_OAUTH_RESPONSE_TYPE,
    VITE_SSM_USER_POOL_OAUTH_SCOPES: import.meta.env
      .VITE_SSM_USER_POOL_OAUTH_SCOPES,
    VITE_SSM_WEBAPP_ORIGIN: import.meta.env.VITE_SSM_WEBAPP_ORIGIN,
  };
}
