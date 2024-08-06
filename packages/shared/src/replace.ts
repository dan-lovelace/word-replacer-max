import { Matcher, QueryPattern } from "@worm/types";

import { logDebug } from "./logging";

const CONTENTS_PROPERTY = "textContent";

const REPLACEMENT_WRAPPER_ELEMENT = "span";

const escapeRegex = (str: string) =>
  str.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");

const nodeNameBlocklist: Set<Node["nodeName"]> = new Set([
  "i",
  "img",
  "link",
  "meta",
  "script",
  "style",
  "svg",
  "textarea",
  "video",
]);

const patternRegex: {
  [key in QueryPattern]: (query: string, flags?: string) => RegExp;
} = {
  case: (query) => new RegExp(escapeRegex(query), "g"),
  default: (query) => new RegExp(escapeRegex(query), "gi"),
  regex: (query, flags) => new RegExp(query, flags),
  wholeWord: (query, flags) =>
    new RegExp(`(?<![^\\W_])${escapeRegex(query)}(?![^\\W_])`, flags),
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
  targetElement: Text,
  query: string,
  replacement: string
) {
  if (targetElement.nodeName === "TITLE") {
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
 * Patterns are applied sequentially and order matters for now. This could be
 * improved by having replacements look ahead at the rest of the patterns.
 */
function getSortedQueryPatterns(queryPatterns: QueryPattern[]) {
  const sortOrder: Record<QueryPattern, number> = {
    case: 2,
    default: 3,
    regex: 1,
    wholeWord: 0,
  };
  const patternArray: QueryPattern[] = Array.from({
    length: Object.keys(sortOrder).length,
  });

  for (const pattern of queryPatterns) {
    patternArray[sortOrder[pattern]] = pattern;
  }

  return patternArray.filter(Boolean);
}

/**
 * Updates innerHTML based on the given element type. Text nodes have their
 * parent element targeted. Takes into account the node name blocklist and will
 * not update blocked elements.
 */
function updateElementWithReplacement(element: Text, replaced: string) {
  const { parentNode } = element;

  if (!parentNode) return;

  const wrapper = document.createElement(REPLACEMENT_WRAPPER_ELEMENT);
  wrapper.innerHTML = replaced;

  const children = Array.from(parentNode.childNodes ?? []);
  const child = parentNode.childNodes.item(children.indexOf(element));

  parentNode.replaceChild(wrapper, child);
}

export function isReplacementEmpty(replacement: Matcher["replacement"]) {
  return !Boolean(replacement);
}

export function replace(
  element: Text | undefined,
  query: string,
  queryPatterns: QueryPattern[],
  replacement: string,
  startPosition: number = 0
) {
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
  const isAlreadyReplaced = Array.from(replacedElements ?? []).findIndex((re) =>
    re.textContent !== replacement
      ? false
      : replacedItem === undefined && query === re.dataset["query"]
  );
  if (isAlreadyReplaced > -1) return;

  /**
   * Determine what to do with the given query patterns.
   */
  if (!queryPatterns || queryPatterns.length < 1) {
    // proceed with default
    const replaced = elementContents.replace(patternRegex.default(query), () =>
      getReplacementHTML(element, query, replacement)
    );

    updateElementWithReplacement(element, replaced);
  } else {
    const sortedPatterns = getSortedQueryPatterns(queryPatterns);

    for (const pattern of sortedPatterns) {
      let replaced = "";

      switch (pattern) {
        case "case":
        case "default": {
          replaced = elementContents.replace(patternRegex[pattern](query), () =>
            getReplacementHTML(element, query, replacement)
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
          replaced = getReplacementHTML(element, query, regexReplaced);
          break;
        }
        case "wholeWord": {
          replaced = elementContents
            .replace(
              patternRegex[pattern](query, getRegexFlags(queryPatterns)),
              () => getReplacementHTML(element, query, replacement)
            )
            .replace(/\s\s+/g, "")
            .trim();
          break;
        }
      }

      updateElementWithReplacement(element, replaced);
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

export function searchNode(
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  found: Text[] = []
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
    !element.parentElement?.dataset["isReplaced"] &&
    !nodeNameBlocklist.has(
      String(element.parentNode?.nodeName.toLowerCase())
    ) &&
    !element.parentElement?.hasAttribute("contenteditable")
  ) {
    found.push(element as unknown as Text);
  }

  return found;
}

export function searchAndReplace(
  element: HTMLElement,
  query: string,
  { queryPatterns, replacement }: Matcher
) {
  const searchResults = searchNode(element, query, queryPatterns) || [];

  for (let i = 0; i < searchResults.length; i++) {
    const result = searchResults[i];

    replace(result, query, queryPatterns, replacement, i);
  }
}
