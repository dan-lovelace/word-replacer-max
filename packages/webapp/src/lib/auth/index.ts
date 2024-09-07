type OauthPath = "authorize" | "login" | "signup";

const oauthPaths: Record<OauthPath, string> = {
  authorize: "/oauth2/authorize",
  login: "/login",
  signup: "/signup",
};

export function getOauthUrl(path: OauthPath) {
  return `https://${import.meta.env.VITE_OAUTH_URL_HOST}${oauthPaths[path]}${
    import.meta.env.VITE_OAUTH_URL_QUERY
  }`;
}
