import { QueryPattern } from "@worm/types";

import { CONTENTS_PROPERTY } from "./lib";
import { nodeNameBlocklist } from "./lib/dom";
import { getRegexFlags, patternRegex } from "./lib/regex";

/**
 * Recursively crawls an element in search of a given query and returns a list
 * of matching Text nodes.
 */
export function findText(
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  found: Text[] = []
) {
  const elementContents = String(element[CONTENTS_PROPERTY]);
  let containsText = false;

  if (!queryPatterns || queryPatterns.length < 1) {
    // default query pattern
    containsText = patternRegex.default(query).test(elementContents);
  } else {
    for (const pattern of queryPatterns) {
      switch (pattern) {
        case "case":
        case "default": {
          containsText = patternRegex[pattern](query).test(elementContents);
          break;
        }

        case "regex":
        case "wholeWord": {
          containsText = patternRegex[pattern](
            query,
            getRegexFlags(queryPatterns)
          ).test(elementContents);
          break;
        }
      }
    }
  }

  if (!containsText) {
    return found;
  }

  if (element.hasChildNodes()) {
    const childElements = Array.from(element.childNodes) as HTMLElement[];

    for (const child of childElements) {
      findText(child, query, queryPatterns, found);
    }
  }

  if (
    element.nodeType === Node.TEXT_NODE &&
    !element.parentElement?.dataset["isReplaced"] &&
    !nodeNameBlocklist.has(String(element.parentNode?.nodeName.toLowerCase()))
  ) {
    found.push(element as unknown as Text);
  }

  return found;
}
