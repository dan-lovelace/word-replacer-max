import {
  PCRECaseMode,
  QueryPattern,
  ReplacementStyle,
} from "@wordreplacermax/types/src/replace";
import { MatcherReplaceProps } from "@wordreplacermax/types/src/rules";

import { getReplacementHTML } from "./dom";

export const patternRegex: {
  [key in QueryPattern]: (query: string, flags?: string) => RegExp;
} = {
  case: (query) => new RegExp(escapeRegex(query), "g"),
  default: (query) => new RegExp(escapeRegex(query), "gi"),
  regex: (query, flags) => new RegExp(query, flags),
  wholeWord: (query, flags) =>
    new RegExp(`(?<![^\\W_])${escapeRegex(query)}(?![^\\W_])`, flags),
};

/**
 * A special RegExp replacement method that injects support of a limited number
 * of PCRE-style case modifications described below. This allows a very
 * customizable way to capitalize replacements by using a well-known standard
 * and without colliding with existing RegExp tokens.
 *
 * See the regular expression replacement tests for usage.
 *
 * Supported tokens:
 *
 * - `\U` - Sets the case mode to uppercase
 * - `\L` - Sets the case mode to lowercase
 * - `\F` - Sets the case mode to titlecase (uppercase first character, then lowercase)
 * - `\E` - Ends the current case modification
 */
export const regExpReplace =
  (
    element: Text,
    query: string,
    matcherReplaceProps: MatcherReplaceProps,
    replacementStyle?: ReplacementStyle
  ) =>
  (match: string, ...args: any[]) => {
    const { replacement, useGlobalReplacementStyle } = matcherReplaceProps;

    const groups = args.slice(0, -2);
    let result = replacement;

    // replace capture groups
    for (let i = 0; i < groups.length; i++) {
      const captureGroupsExp = new RegExp("\\$" + (i + 1), "g");

      result = result.replace(captureGroupsExp, groups[i] || "");
    }

    // handle PCRE-style case modifications
    let caseMode: PCRECaseMode = null;
    let processedResult = "";
    let i = 0;

    while (i < result.length) {
      if (result.slice(i).match(/^\\[ULFE]/)) {
        const caseToken = result.slice(i, i + 2);

        if (caseToken === "\\U") {
          caseMode = "upper";
        } else if (caseToken === "\\L") {
          caseMode = "lower";
        } else if (caseToken === "\\F") {
          caseMode = "title";
        } else if (caseToken === "\\E") {
          caseMode = null;
        }

        i += 2;
      } else if (result.slice(i).match(/^\\./)) {
        // escaped character
        processedResult += result[i + 1];
        i += 2;
      } else if (result.slice(i).match(/^\$[0-9]/)) {
        // numbered backreference
        const groupNum = parseInt(result[i + 1]);

        processedResult += groups[groupNum - 1] || "";
        i += 2;
      } else {
        // regular character, apply case modification
        let char = result[i];

        if (caseMode === "upper") {
          char = char.toUpperCase();
        } else if (caseMode === "lower") {
          char = char.toLowerCase();
        } else if (caseMode === "title") {
          char = char.toUpperCase();
          caseMode = "lower";
        }

        processedResult += char;
        i++;
      }
    }

    const resultHTML = getReplacementHTML(
      element,
      query,
      {
        replacement: processedResult,
        useGlobalReplacementStyle,
      },
      replacementStyle
    );

    return resultHTML;
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
