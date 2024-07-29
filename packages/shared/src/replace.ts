import { Matcher, QueryPattern } from "@worm/types";

import { logDebug } from "./logging";

const CONTENTS_PROPERTY = "textContent";

const REPLACEMENT_WRAPPER_ELEMENT = "span";

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

/**
 * Returns regular expression flags to use based on a list of query patterns.
 * For instance, absence of the `case` pattern appends the "ignore case" flag
 * `i`.
 */
function getRegexFlags(queryPatterns: QueryPattern[]) {
  let flags = "g";

  if (!queryPatterns.includes("case")) {
    flags += "i";
  }

  return flags;
}

/**
 * Gets the HTML necessary to inject back into a target element once its text
 * has been replaced. Replacement HTML may include new elements around the
 * replaced text in order to keep track of what's already been modified. This
 * is necessary to avoid recursive replacements and could be used as a CSS
 * selector if they ever need style.
 */
function getReplacementHTML(
  targetElement: HTMLElement,
  query: string,
  replacement: string
) {
  if (targetElement.nodeName === "TITLE") {
    // do not replace innerHTML of titles
    return replacement;
  }

  const now = new Date().getTime().toString();
  const wrapper = document.createElement(REPLACEMENT_WRAPPER_ELEMENT);
  wrapper[CONTENTS_PROPERTY] = replacement;
  wrapper.dataset["isReplaced"] = now;
  wrapper.dataset["query"] = query;

  return wrapper.outerHTML;
}

/**
 * Updates innerHTML based on the given element type. Text nodes have their
 * parent element targeted. Takes into account the node name blocklist and will
 * not update blocked elements.
 */
function updateInnerHTML(targetElement: HTMLElement, newHTML: string) {
  const isTextTarget = targetElement.nodeType === Node.TEXT_NODE;
  const targetParent = isTextTarget
    ? targetElement
    : targetElement.parentElement;
  const parentNodeName = String(targetParent?.nodeName.toLowerCase());

  if (parentNodeBlocklist.includes(parentNodeName)) {
    return;
  }

  targetElement.innerHTML = newHTML;
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

  /**
   * Text nodes are treated different than Element nodes. Instead of targeting
   * themselves, text nodes reference their parent when it comes to
   * replacing inner HTML because there is no such thing as `innerHTML`.
   */
  const isTextTarget = element.nodeType === Node.TEXT_NODE;
  const targetElement = isTextTarget ? element.parentElement! : element;
  const elementContents = String(targetElement[CONTENTS_PROPERTY]);

  /**
   * Build a list of all replaced elements inside the target element. This is
   * used later when determining whether to do a subsequent replacement of one
   * that has already been completed.
   */
  const replacedElements = targetElement.querySelectorAll<HTMLElement>(
    `${REPLACEMENT_WRAPPER_ELEMENT}[data-is-replaced]`
  );

  /**
   * Using the query, see if any elements have already been replaced and return
   * early if so.
   */
  const isAlreadyReplaced = Array.from(replacedElements).some((re) =>
    re.textContent !== replacement ? false : query === re.dataset["query"]
  );
  if (isAlreadyReplaced) return;

  /**
   * Determine what to do with the given query patterns.
   */
  if (!queryPatterns || queryPatterns.length < 1) {
    // proceed with default
    const replaced = elementContents.replace(patternRegex.default(query), () =>
      getReplacementHTML(targetElement, query, replacement)
    );

    updateInnerHTML(targetElement, replaced);
  } else {
    for (const pattern of queryPatterns) {
      let replaced = "";

      switch (pattern) {
        case "case":
        case "default": {
          replaced = elementContents.replace(patternRegex[pattern](query), () =>
            getReplacementHTML(targetElement, query, replacement)
          );
          break;
        }

        case "regex": {
          replaced = elementContents.replace(
            patternRegex[pattern](query, getRegexFlags(queryPatterns)),
            () => getReplacementHTML(targetElement, query, replacement)
          );
          break;
        }

        case "wholeWord": {
          replaced = elementContents
            .replace(
              patternRegex[pattern](query, getRegexFlags(queryPatterns)),
              () => getReplacementHTML(targetElement, query, ` ${replacement} `)
            )
            .replace(/\s\s+/g, "")
            .trim();
          break;
        }
      }

      updateInnerHTML(targetElement, replaced);
    }
  }
}

export function replaceAll(matchers: Matcher[], startDocument?: Document) {
  const startAtElement = startDocument ?? document;

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
