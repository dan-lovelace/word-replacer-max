import { getEnvConfig } from "@worm/shared/src/config";

type OAuthPath = "authorize" | "login" | "signup";

const oAuthPaths: Record<OAuthPath, string> = {
  authorize: "/oauth2/authorize",
  login: "/login",
  signup: "/signup",
};

export function getOAuthUrl(path: OAuthPath) {
  const envConfig = getEnvConfig();

  return `https://${envConfig.VITE_COGNITO_USER_POOL_CUSTOM_DOMAIN}${oAuthPaths[path]}${envConfig.VITE_COGNITO_HOSTED_UI_QUERY}`;
}
