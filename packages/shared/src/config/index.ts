import { ViteEnvConfig } from "@worm/types/src/config";

import { assert } from "../assert";

import values from "./values";

export function getEnvConfig(): Required<ViteEnvConfig> {
  assert(values.VITE_API_ORIGIN, "VITE_API_ORIGIN is required");
  assert(values.VITE_RECAPTCHA_SITE_KEY, "VITE_RECAPTCHA_SITE_KEY is required");
  assert(
    values.VITE_SSM_USER_POOL_HOSTED_UI_QUERY,
    "VITE_SSM_USER_POOL_HOSTED_UI_QUERY is required"
  );
  assert(
    values.VITE_SSM_USER_POOL_CLIENT_ID,
    "VITE_SSM_USER_POOL_CLIENT_ID is required"
  );
  assert(
    values.VITE_SSM_USER_POOL_CUSTOM_DOMAIN,
    "VITE_SSM_USER_POOL_CUSTOM_DOMAIN is required"
  );
  assert(
    values.VITE_SSM_USER_POOL_PROVIDER_URL,
    "VITE_SSM_USER_POOL_PROVIDER_URL is required"
  );
  assert(values.VITE_SSM_USER_POOL_ID, "VITE_SSM_USER_POOL_ID is required");
  assert(
    values.VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN,
    "VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_IN is required"
  );
  assert(
    values.VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT,
    "VITE_SSM_USER_POOL_OAUTH_REDIRECT_SIGN_OUT is required"
  );
  assert(
    values.VITE_SSM_USER_POOL_OAUTH_RESPONSE_TYPE,
    "VITE_SSM_USER_POOL_OAUTH_RESPONSE_TYPE is required"
  );
  assert(
    values.VITE_SSM_USER_POOL_OAUTH_SCOPES,
    "VITE_SSM_USER_POOL_OAUTH_SCOPES is required"
  );
  assert(values.VITE_SSM_WEBAPP_ORIGIN, "VITE_SSM_WEBAPP_ORIGIN is required");

  return values;
}
