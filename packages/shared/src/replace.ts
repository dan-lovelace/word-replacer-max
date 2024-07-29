import { Matcher, QueryPattern } from "@worm/types";

import { logDebug } from "./logging";

const escapeRegex = (str: string) =>
  str.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");

const parentNodeBlocklist: Node["nodeName"][] = [
  "i",
  "img",
  "link",
  "meta",
  "script",
  "style",
  "svg",
  "video",
];

const patternRegex: {
  [key in QueryPattern]: (query: string, flags?: string) => RegExp;
} = {
  case: (query) => new RegExp(query, "g"),
  default: (query) => new RegExp(query, "gi"),
  regex: (query, flags) => new RegExp(query, flags),
  wholeWord: (query, flags) =>
    new RegExp(`(^|\\s)${escapeRegex(query)}($|\\s)`, flags),
};

function getFlags(queryPatterns: QueryPattern[]) {
  let flags = "g";

  if (!queryPatterns.includes("case")) {
    flags += "i";
  }

  return flags;
}

export function searchAndReplace(
  element: HTMLElement,
  query: string,
  { queryPatterns, replacement }: Matcher
) {
  const searchResults = searchNode(element, query, queryPatterns) || [];

  for (const result of searchResults) {
    replace(result, query, queryPatterns, replacement);
  }
}

export function searchNode(
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  found: HTMLElement[] = []
) {
  const elementContents = String(element.textContent);
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
            getFlags(queryPatterns)
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
      searchNode(child, query, queryPatterns, found);
    }
  }

  if (
    element.nodeType === Node.TEXT_NODE &&
    !parentNodeBlocklist.includes(
      String(element.parentNode?.nodeName.toLowerCase())
    )
  ) {
    found.push(element);
  }

  return found;
}

export function replace(
  element: HTMLElement | null,
  query: string,
  queryPatterns: QueryPattern[],
  replacement: string
) {
  if (element === null) return;

  const { parentElement } = element;

  if (parentElement?.dataset["isReplaced"]) {
    // already replaced
    return;
  }

  const contentsAttribute: keyof HTMLElement = "textContent";
  const elementContents = String(element[contentsAttribute]);

  if (!queryPatterns || queryPatterns.length < 1) {
    // default query pattern
    element[contentsAttribute] = elementContents.replace(
      patternRegex.default(query),
      replacement
    );
  } else {
    for (const pattern of queryPatterns) {
      switch (pattern) {
        case "case":
        case "default": {
          element[contentsAttribute] = elementContents.replace(
            patternRegex[pattern](query),
            replacement
          );
          break;
        }

        case "regex": {
          element[contentsAttribute] = elementContents.replace(
            patternRegex[pattern](query, getFlags(queryPatterns)),
            replacement
          );
          break;
        }

        case "wholeWord": {
          element[contentsAttribute] = elementContents
            .replace(
              patternRegex[pattern](query, getFlags(queryPatterns)),
              ` ${replacement} `
            )
            .replace(/\s\s+/g, "")
            .trim();
          break;
        }
      }
    }
  }

  if (parentElement) {
    parentElement.dataset["isReplaced"] = new Date().getTime().toString();
  }
}

export function replaceAll(matchers: Matcher[], htmlStart?: HTMLHtmlElement) {
  const startAtElement = htmlStart ?? document;

  const body = startAtElement.querySelector("body");
  if (!body) {
    logDebug("No `body` element found");
  }

  const head = startAtElement.querySelector("head");
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
