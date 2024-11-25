import { Matcher } from "../rules";

import { ApiResponse } from "./";

export type ApiShareRequest = {
  matchers: ApiShareRequestMatcher[];
};

export type ApiShareRequestMatcher = Omit<Matcher, "identifier">;

export type ApiShareResponse = ApiResponse<{
  url: string;
}>;

export type ShareRequest = {
  matchers: Matcher[];
};
