import { ApiRouteIdentifier } from "@wordreplacermax/types/src/api";

import { getEnvConfig } from "../config";

import { getApiRoute } from "./endpoints";

export function getApiEndpoint(name: ApiRouteIdentifier) {
  const envConfig = getEnvConfig();

  return `${envConfig.VITE_API_ORIGIN}${getApiRoute(name)}`;
}
