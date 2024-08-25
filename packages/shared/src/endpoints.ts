export const apiEndpoints = {
  AUTH_TOKENS: "/auth/tokens",
};

export function getApiEndpoint(name: keyof typeof apiEndpoints) {
  return `${import.meta.env.VITE_API_ORIGIN}${apiEndpoints[name]}`;
}
