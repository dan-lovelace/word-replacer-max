import { ReplacementStyle } from "@wordreplacermax/types/src/replace";
import { Matcher } from "@wordreplacermax/types/src/rules";

import { logDebug } from "../logging";

import { findText } from "./find-text";
import { replaceText } from "./replace-text";

function searchAndReplace(
  element: HTMLElement,
  query: string,
  matcher: Matcher,
  replacementStyle: ReplacementStyle | undefined
) {
  const { queryPatterns } = matcher;
  const searchResults = findText(element, query, queryPatterns) || [];

  for (let position = 0; position < searchResults.length; position++) {
    const textElement = searchResults[position];

    replaceText(textElement, query, matcher, replacementStyle, position);
  }
}

export function replaceAll(
  matchers: Matcher[],
  replacementStyle: ReplacementStyle | undefined,
  startDocument: Document | HTMLElement = document
) {
  const body = startDocument.querySelector("body");
  if (!body) {
    logDebug("No `body` element found");
  }

  const head = startDocument.querySelector("head");
  if (!head) {
    logDebug("No `head` element found");
  }

  for (const matcher of matchers) {
    if (matcher.active !== true) continue;

    for (const query of matcher.queries) {
      if (body) {
        searchAndReplace(body, query, matcher, replacementStyle);
      }

      if (head) {
        for (const title of Array.from(head.querySelectorAll("title"))) {
          searchAndReplace(title, query, matcher, replacementStyle);
        }
      }
    }
  }
}

export * from "./find-text";
export * from "./lib";
export * from "./replace-text";
