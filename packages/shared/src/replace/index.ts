import { Matcher } from "@worm/types";

import { findText } from "./find-text";
import { replaceText } from "./replace-text";

import { logDebug } from "../logging";

function searchAndReplace(
  element: HTMLElement,
  query: string,
  { queryPatterns, replacement }: Matcher
) {
  const searchResults = findText(element, query, queryPatterns) || [];

  for (let position = 0; position < searchResults.length; position++) {
    const result = searchResults[position];

    replaceText(result, query, queryPatterns, replacement, position);
  }
}

export function replaceAll(matchers: Matcher[], startDocument = document) {
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
        searchAndReplace(body, query, matcher);
      }

      if (head) {
        for (const title of Array.from(head.querySelectorAll("title"))) {
          searchAndReplace(title, query, matcher);
        }
      }
    }
  }
}

export * from "./find-text";
export * from "./lib";
export * from "./replace-text";
