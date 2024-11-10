import { findText, replaceText } from "@worm/shared/src/replace";
import { QueryPattern, ReplacementStyle } from "@worm/types/src/replace";

/**
 * Utility function to reduce code duplication.
 */
export function searchAndReplace(
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  replacement: string,
  replacementStyle?: ReplacementStyle
) {
  const results = findText(element, query, queryPatterns);

  replaceText(
    results[0],
    query,
    { queryPatterns, replacement, useGlobalReplacementStyle: true },
    replacementStyle
  );
}
