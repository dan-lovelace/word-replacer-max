import { findText, replaceText } from "@web-extension/shared/src/replace";
import { DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE } from "@web-extension/shared/src/replace/lib/style";
import {
  QueryPattern,
  ReplacementStyle,
} from "@wordreplacermax/types/src/replace";

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
    {
      queryPatterns,
      replacement,
      useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
    },
    replacementStyle
  );
}
