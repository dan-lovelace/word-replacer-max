import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { getApiEndpoint } from "@worm/shared/src/api";
import {
  ApiAuthTokensRequest,
  ApiAuthTokensResponse,
  ApiResponse,
} from "@worm/types";

export const useAuthTokens = (
  options?: Partial<
    UseMutationOptions<
      AxiosRequestConfig<ApiAuthTokensResponse>,
      AxiosError<ApiResponse<ApiAuthTokensResponse>, any>,
      ApiAuthTokensRequest
    >
  >
) =>
  useMutation<
    AxiosRequestConfig<ApiAuthTokensResponse>,
    AxiosError<ApiResponse<ApiAuthTokensResponse>>,
    ApiAuthTokensRequest
  >({
    ...options,
    retry: false,
    mutationFn: (body) => axios.post(getApiEndpoint("POST:authTokens"), body),
  });
