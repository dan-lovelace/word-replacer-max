import { ReplacementSuggest, ToneOption } from "@worm/types";

export const DEFAULT_TONE_OPTION: ToneOption = "neutral";

export const DEFAULT_REPLACEMENT_SUGGEST: ReplacementSuggest = {
  active: false,
  lastSuggestions: {
    suggestions: [],
  },
  selectedTone: DEFAULT_TONE_OPTION,
};
