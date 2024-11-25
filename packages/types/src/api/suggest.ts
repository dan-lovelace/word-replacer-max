import { ReplacementSuggestion } from "../replace";
import { Matcher } from "../rules";

import { ApiResponse } from "./";

export type ApiSuggestRequest = {
  queries: Matcher["queries"];
  tone: ToneOption;
};

export type ApiSuggestResponse = ApiResponse<ApiSuggestResponseData>;

export type ApiSuggestResponseData = {
  suggestions: ReplacementSuggestion[];
  tone: ToneOption;
};

export type ToneOption =
  | "casual"
  | "emotional"
  | "neutral"
  | "poetic"
  | "professional"
  | "technical"
  | "witty";
