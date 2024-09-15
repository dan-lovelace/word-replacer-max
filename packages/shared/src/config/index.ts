import { EnvConfigProps } from "@worm/types";

function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

export function getEnvConfig(): EnvConfigProps {
  assert(import.meta.env.VITE_ALLOWED_CONTENT_ORIGINS);
  assert(import.meta.env.VITE_API_ORIGIN);
  assert(import.meta.env.VITE_COGNITO_HOSTED_UI_QUERY);
  assert(import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID);
  assert(import.meta.env.VITE_COGNITO_USER_POOL_CUSTOM_DOMAIN);
  assert(import.meta.env.VITE_COGNITO_USER_POOL_ENDPOINT);
  assert(import.meta.env.VITE_COGNITO_USER_POOL_ID);
  assert(import.meta.env.VITE_WEBAPP_ORIGIN);

  return {
    VITE_ALLOWED_CONTENT_ORIGINS: import.meta.env.VITE_ALLOWED_CONTENT_ORIGINS,
    VITE_API_ORIGIN: import.meta.env.VITE_API_ORIGIN,
    VITE_COGNITO_HOSTED_UI_QUERY: import.meta.env.VITE_COGNITO_HOSTED_UI_QUERY,
    VITE_COGNITO_USER_POOL_CLIENT_ID: import.meta.env
      .VITE_COGNITO_USER_POOL_CLIENT_ID,
    VITE_COGNITO_USER_POOL_CUSTOM_DOMAIN: import.meta.env
      .VITE_COGNITO_USER_POOL_CUSTOM_DOMAIN,
    VITE_COGNITO_USER_POOL_ENDPOINT: import.meta.env
      .VITE_COGNITO_USER_POOL_ENDPOINT,
    VITE_COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    VITE_WEBAPP_ORIGIN: import.meta.env.VITE_WEBAPP_ORIGIN,
  };
}
