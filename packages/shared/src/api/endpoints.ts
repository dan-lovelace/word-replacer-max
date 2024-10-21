const apiRoutes = {
  "GET:authWhoAmI": "/auth/whoami",
  "GET:healthCheck": "/",
  "POST:authTokens": "/auth/tokens",
  "POST:marketingSignup": "/marketing/signup",
  "POST:share": "/share",
  "POST:suggest": "/suggest",
} as const;

export type ApiRoutes = typeof apiRoutes;

export type ApiRouteIdentifier = keyof ApiRoutes;

export type ApiRoute<T extends ApiRouteIdentifier> = ApiRoutes[T];

export type ApiUsageLimits = Partial<
  Record<ApiRouteIdentifier, { periodDays: number; threshold: number }>
>;

export const getApiRoute = <T extends ApiRouteIdentifier>(
  identifier: T
): ApiRoute<T> => {
  return apiRoutes[identifier];
};
