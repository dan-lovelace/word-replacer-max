import { getEnvConfig } from "../config";

import { API_PATHS } from "./endpoints";

export function getApiEndpoint(name: keyof typeof API_PATHS) {
  const envConfig = getEnvConfig();

  return `${envConfig.VITE_API_ORIGIN}${API_PATHS[name]}`;
}
