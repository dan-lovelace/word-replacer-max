const queryPatterns = ["case", "default", "regex", "wholeWord"] as const;

/**
 * PCRE case modes for use in regex replacements.
 */
export type PCRECaseMode = "lower" | "title" | "upper" | null;

export type QueryPattern = (typeof queryPatterns)[number];

export type ReplacementStyle = Partial<{
  active: boolean;
  backgroundColor: string;
  color: string;
  options: ReplacementStyleOption[];
}>;

export type ReplacementStyleOption =
  | "backgroundColor"
  | "bold"
  | "color"
  | "italic"
  | "strikethrough"
  | "underline";

export type ReplacementSuggest = {
  active: boolean;
};

export type ReplacementSuggestion = {
  text: string;
};

export type RuleGroups = {
  active: boolean;
  isFiltered: boolean;
};

export type VueNodeInfo = {
  commentMarkers: Comment[];
  isVueManaged: boolean;
};
