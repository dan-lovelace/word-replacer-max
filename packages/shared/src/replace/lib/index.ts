import { QueryPattern } from "@worm/types/src/replace";
import { Matcher } from "@worm/types/src/rules";

export const CONTENTS_PROPERTY = "textContent";

export const REPLACEMENT_WRAPPER_ELEMENT = "span";

/**
 * Patterns are applied sequentially and order matters for now. This could be
 * improved by having replacements look ahead at the rest of the patterns.
 */
export function getSortedQueryPatterns(queryPatterns: QueryPattern[]) {
  const sortOrder: Record<QueryPattern, number> = {
    case: 2,
    default: 3,
    regex: 1,
    wholeWord: 0,
  };
  const patternArray: QueryPattern[] = Array.from({
    length: Object.keys(sortOrder).length,
  });

  for (const pattern of queryPatterns) {
    patternArray[sortOrder[pattern]] = pattern;
  }

  return patternArray.filter(Boolean);
}

export function isReplacementEmpty(replacement: Matcher["replacement"]) {
  return !Boolean(replacement);
}
