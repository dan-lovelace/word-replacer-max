import { QueryPattern } from "@worm/types";

export const patternRegex: {
  [key in QueryPattern]: (query: string, flags?: string) => RegExp;
} = {
  case: (query) => new RegExp(escapeRegex(query), "g"),
  default: (query) => new RegExp(escapeRegex(query), "gi"),
  regex: (query, flags) => new RegExp(query, flags),
  wholeWord: (query, flags) =>
    new RegExp(`(?<![^\\W_])${escapeRegex(query)}(?![^\\W_])`, flags),
};

export function escapeRegex(str: string) {
  return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Returns regular expression flags to use based on a list of query patterns.
 * For instance, absence of the `case` pattern appends the "ignore case" flag
 * `i`.
 */
export function getRegexFlags(queryPatterns: QueryPattern[]) {
  let flags = "g";

  if (!queryPatterns.includes("case")) {
    flags += "i";
  }

  return flags;
}
