import { ApiResponse, Matcher } from "../";
import { ReplacementSuggestion } from "../replacement";

export type ApiSuggestRequest = {
  queries: Matcher["queries"];
  tone: ToneOption;
};

export type ApiSuggestResponse = ApiResponse<{
  suggestions: ReplacementSuggestion[];
  tone: ToneOption;
}>;

export type ToneOption =
  | "casual"
  | "emotional"
  | "neutral"
  | "poetic"
  | "professional"
  | "technical"
  | "witty";
