import { getEnvConfig } from "../config";
import { ApiRouteIdentifier, getApiRoute } from "./endpoints";

export function getApiEndpoint(name: ApiRouteIdentifier) {
  const envConfig = getEnvConfig();

  return `${envConfig.VITE_API_ORIGIN}${getApiRoute(name)}`;
}
