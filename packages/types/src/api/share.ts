import { Matcher } from "..";

interface ResponseField<T> {
  message: string;
  value?: T;
}

export type ApiShareRequest = {
  matchers: ApiShareRequestMatcher[];
};

export type ApiShareRequestMatcher = Omit<Matcher, "identifier">;

export type ApiShareResponse = ApiResponse<ApiShareResponseData>;

export type ApiShareResponseData = {
  url: string;
};

export type ApiResponse<DataType> = {
  data?: ResponseField<DataType>;
  error?: ResponseField<DataType>;
};

export type ShareRequest = {
  matchers: Matcher[];
};
