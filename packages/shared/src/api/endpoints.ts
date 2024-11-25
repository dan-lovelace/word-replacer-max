import { API_ROUTES, ApiRoute, ApiRouteIdentifier } from "@worm/types/src/api";

export const getApiRoute = <T extends ApiRouteIdentifier>(
  identifier: T
): ApiRoute<T> => {
  return API_ROUTES[identifier];
};
