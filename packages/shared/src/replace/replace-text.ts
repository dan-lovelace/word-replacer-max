import { Matcher, ReplacementStyle } from "@worm/types";

import {
  CONTENTS_PROPERTY,
  getSortedQueryPatterns,
  isReplacementEmpty,
  REPLACEMENT_WRAPPER_ELEMENT,
} from "./lib";
import { getReplacementHTML, replaceTextNode } from "./lib/dom";
import { getRegexFlags, patternRegex } from "./lib/regex";

export function replaceText(
  element: Text | undefined,
  query: string,
  matcher: Pick<
    Matcher,
    "queryPatterns" | "replacement" | "useGlobalReplacementStyle"
  >,
  replacementStyle: ReplacementStyle | undefined,
  startPosition: number = 0
) {
  const { queryPatterns, replacement, useGlobalReplacementStyle } = matcher;

  if (!element || isReplacementEmpty(replacement)) return;

  const { parentNode } = element;

  /**
   * Get the element's contents according to the target property.
   */
  const elementContents = String(element[CONTENTS_PROPERTY]);

  /**
   * Build a list of all replaced elements inside the target element. This is
   * used later when determining whether to do a subsequent replacement of one
   * that has already been completed.
   */
  const replacedElements = parentNode?.querySelectorAll<HTMLElement>(
    `${REPLACEMENT_WRAPPER_ELEMENT}[data-is-replaced]`
  );

  /**
   * Using the query, see if any elements have already been replaced and return
   * early if so.
   */
  const replacedItem = replacedElements?.item(startPosition);
  const isAlreadyReplaced = Array.from(replacedElements ?? []).findIndex(
    (replacedElement) =>
      replacedElement[CONTENTS_PROPERTY] !== replacement
        ? false
        : replacedItem === undefined &&
          query === replacedElement.dataset["query"]
  );
  if (isAlreadyReplaced > -1) return;

  /**
   * Determine what to do with the given query patterns.
   */
  if (!queryPatterns || queryPatterns.length < 1) {
    // proceed with default
    const replaced = elementContents.replace(patternRegex.default(query), () =>
      getReplacementHTML(element, query, matcher, replacementStyle)
    );

    replaceTextNode(element, replaced);
  } else {
    const sortedPatterns = getSortedQueryPatterns(queryPatterns);

    for (const pattern of sortedPatterns) {
      let replaced = "";

      switch (pattern) {
        case "case":
        case "default": {
          replaced = elementContents.replace(patternRegex[pattern](query), () =>
            getReplacementHTML(element, query, matcher, replacementStyle)
          );
          break;
        }
        case "regex": {
          // replace by string first to avoid dropping references
          const regexReplaced = elementContents.replace(
            patternRegex[pattern](query, getRegexFlags(queryPatterns)),
            replacement
          );

          // apply the HTML after replacement
          replaced = getReplacementHTML(
            element,
            query,
            {
              replacement: regexReplaced,
              useGlobalReplacementStyle,
            },
            replacementStyle
          );
          break;
        }
        case "wholeWord": {
          replaced = elementContents
            .replace(
              patternRegex[pattern](query, getRegexFlags(queryPatterns)),
              () =>
                getReplacementHTML(element, query, matcher, replacementStyle)
            )
            .replace(/\s\s+/g, "");
          break;
        }
      }

      replaceTextNode(element, replaced);
    }
  }
}
