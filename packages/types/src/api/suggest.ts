import { ApiResponse, Matcher } from "../";
import { ReplacementSuggestion } from "../replacement";

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
