import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getApiEndpoint } from "@worm/shared/src/api";
import { ApiAuthTokens, ApiAuthTokensResponse } from "@worm/types";

import { queryKeys } from "../cache";

type AuthTokensQueryKey = [string, { code: string }];

export const useAuthTokens = (
  oauthCode: string | undefined,
  options?: Partial<
    UseQueryOptions<ApiAuthTokens, Error, ApiAuthTokens, AuthTokensQueryKey>
  >
) =>
  useQuery<ApiAuthTokens, Error, ApiAuthTokens, AuthTokensQueryKey>({
    enabled: false,
    queryFn: async ({ queryKey: [_, { code: queryKeyCode }] }) => {
      const result = await fetch(getApiEndpoint("POST:authTokens"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: queryKeyCode }),
      });
      const resultJson = (await result.json()) as ApiAuthTokensResponse;

      if (!result.ok) {
        throw new Error(JSON.stringify(resultJson.error));
      }

      return resultJson.data;
    },
    queryKey: [queryKeys.AUTH_TOKENS, { code: String(oauthCode) }],
    retry: false,
    ...options,
  });
