import { Matcher } from "..";

export type ApiShareRequest = {
  matchers: ApiShareRequestMatcher[];
};

export type ApiShareRequestMatcher = Omit<Matcher, "identifier">;

export type ApiShareResponse = {
  url: string;
};

export type ShareRequest = {
  matchers: Matcher[];
};
