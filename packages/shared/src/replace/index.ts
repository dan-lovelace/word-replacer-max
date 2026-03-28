import { ReplacementStyle } from "@worm/types/src/replace";
import { Matcher } from "@worm/types/src/rules";

import { logDebug } from "../logging";

import { findText } from "./find-text";
import { replaceInputElements } from "./replace-input";
import { replaceText } from "./replace-text";

function searchAndReplace(
  element: HTMLElement,
  query: string,
  matcher: Matcher,
  replacementStyle: ReplacementStyle | undefined,
  options: { allowContentEditable?: boolean } = {}
) {
  const { queryPatterns } = matcher;
  const searchResults = findText(element, query, queryPatterns, [], options) || [];

  for (let position = 0; position < searchResults.length; position++) {
    const textElement = searchResults[position];

    replaceText(textElement, query, matcher, replacementStyle, position);
  }
}

export function replaceElement(
  element: HTMLElement,
  matchers: Matcher[],
  replacementStyle: ReplacementStyle | undefined
) {
  for (const matcher of matchers) {
    if (matcher.active !== true) continue;

    for (const query of matcher.queries) {
      searchAndReplace(element, query, matcher, replacementStyle, {
        allowContentEditable: true,
      });
    }
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

export function replaceAllInputElements(
  matchers: Matcher[],
  replacementStyle: ReplacementStyle | undefined,
  root: Document | HTMLElement = document
) {
  replaceInputElements(matchers, replacementStyle, root, {
    replaceElement,
  });
}

export * from "./find-text";
export * from "./lib";
export * from "./replace-input";
export * from "./replace-text";
