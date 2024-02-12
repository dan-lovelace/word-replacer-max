import { Matcher, QueryPattern } from "@worm/types";

import { logDebug } from "./logging";

const escapeRegex = (str: string) =>
  str.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");

const parentNodeBlocklist: Node["nodeName"][] = [
  "head",
  "i",
  "img",
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

export function searchNode(
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  found: HTMLElement[] = []
) {
  const textContent = String(element.textContent);
  let containsText = false;

  if (!queryPatterns || queryPatterns.length < 1) {
    // default query pattern
    containsText = patternRegex.default(query).test(textContent);
  } else {
    for (const pattern of queryPatterns) {
      switch (pattern) {
        case "case":
        case "default": {
          containsText = patternRegex[pattern](query).test(textContent);
          break;
        }

        case "regex":
        case "wholeWord": {
          containsText = patternRegex[pattern](
            query,
            getFlags(queryPatterns)
          ).test(textContent);
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
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  replacement: string
) {
  const textContent = String(element.textContent);

  if (!queryPatterns || queryPatterns.length < 1) {
    // default query pattern
    element.textContent = textContent.replace(
      patternRegex.default(query),
      replacement
    );
  } else {
    for (const pattern of queryPatterns) {
      switch (pattern) {
        case "case":
        case "default": {
          element.textContent = textContent.replace(
            patternRegex[pattern](query),
            replacement
          );
          break;
        }

        case "regex": {
          element.textContent = textContent.replace(
            patternRegex[pattern](query, getFlags(queryPatterns)),
            replacement
          );
          break;
        }

        case "wholeWord": {
          element.textContent = textContent
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
}

export function replaceAll(matchers: Matcher[]) {
  const body = document.querySelector("body");
  if (!body) {
    return logDebug("No body element found");
  }

  for (const matcher of matchers) {
    if (matcher.active !== true) continue;

    for (const query of matcher.queries) {
      const results = searchNode(body, query, matcher.queryPatterns) || [];

      for (const result of results) {
        replace(result, query, matcher.queryPatterns, matcher.replacement);
      }
    }
  }
}
