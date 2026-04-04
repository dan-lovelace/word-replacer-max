import { Matcher } from "@worm/types/src/rules";

import { logDebug } from "../logging";

import { findText } from "./find-text";
import { replaceText, ReplaceTextOptions } from "./replace-text";

function searchAndReplace(
  element: HTMLElement,
  query: string,
  matcher: Matcher,
  options: ReplaceTextOptions = {}
) {
  const { queryPatterns } = matcher;
  const searchResults =
    findText(element, query, queryPatterns, options, []) || [];

  for (let position = 0; position < searchResults.length; position++) {
    const textElement = searchResults[position];

    replaceText(textElement, query, matcher, options, position);
  }
}

export function replaceAll(
  matchers: Matcher[],
  options: ReplaceTextOptions = {},
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
        searchAndReplace(body, query, matcher, options);
      }

      if (head) {
        for (const title of Array.from(head.querySelectorAll("title"))) {
          searchAndReplace(title, query, matcher, options);
        }
      }
    }
  }
}

export * from "./find-text";
export * from "./lib";
export * from "./replace-input";
export * from "./replace-text";
