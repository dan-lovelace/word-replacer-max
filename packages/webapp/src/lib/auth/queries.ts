import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getApiEndpoint } from "@worm/shared";
import { ApiAuthTokensResponse } from "@worm/types";

import { queryKeys } from "../cache";

type AuthTokensQueryKey = [string, { code: string }];

export const useAuthTokens = (
  oauthCode: string | undefined,
  options?: Partial<
    UseQueryOptions<
      ApiAuthTokensResponse,
      Error,
      ApiAuthTokensResponse,
      AuthTokensQueryKey
    >
  >
) =>
  useQuery<
    ApiAuthTokensResponse,
    Error,
    ApiAuthTokensResponse,
    AuthTokensQueryKey
  >({
    enabled: false,
    queryFn: async ({ queryKey: [_, { code: queryKeyCode }] }) => {
      const response = await fetch(getApiEndpoint("AUTH_TOKENS"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: queryKeyCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data.error));
      }

      return data as ApiAuthTokensResponse;
    },
    queryKey: [queryKeys.AUTH_TOKENS, { code: String(oauthCode) }],
    retry: false,
    ...options,
  });
