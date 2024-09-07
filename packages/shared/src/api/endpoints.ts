export const API_PATHS = Object.freeze({
  AUTH_TOKENS: "/auth/tokens",
  AUTH_WHOAMI: "/auth/whoami",
  SHARE: "/share",
});

export function getApiEndpoint(name: keyof typeof API_PATHS) {
  return `${import.meta.env.VITE_API_ORIGIN}${API_PATHS[name]}`;
}
