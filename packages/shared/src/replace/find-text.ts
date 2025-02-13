import { QueryPattern } from "@worm/types/src/replace";

import { CONTENTS_PROPERTY } from "./lib";
import { nodeNameBlocklist } from "./lib/dom";
import { getRegexFlags, patternRegex } from "./lib/regex";

function checkElementContent(
  content: string,
  query: string,
  queryPatterns: QueryPattern[]
) {
  if (!queryPatterns || queryPatterns.length < 1) {
    return patternRegex.default(query).test(content);
  }

  let containsText = false;

  /**
   * This iterates through all given patterns exhaustively because of pattern
   * precedence. For example, `wholeWord` failing to match will override a
   * previous `case` match and return false. It is not acceptable to `some()`
   * the patterns list.
   */
  for (const pattern of queryPatterns) {
    switch (pattern) {
      case "case":
      case "default": {
        containsText = patternRegex[pattern](query).test(content);
        break;
      }

      case "regex":
      case "wholeWord": {
        containsText = patternRegex[pattern](
          query,
          getRegexFlags(queryPatterns)
        ).test(content);
        break;
      }
    }
  }

  return containsText;
}

function getAdjacentTextNodes(node: Node): Text[] {
  const nodes: Text[] = [];
  let currentNode: Node | null = node;

  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      nodes.push(currentNode as Text);
    } else {
      break;
    }

    currentNode = currentNode.nextSibling;
  }

  return nodes;
}

/**
 * Makes several attempts at matching and returning matched text from a list of
 * text nodes. If more than one element is provided, we have to test matching
 * with and without spaces between each one's text content to allow matching on
 * queries with more than one word.
 */
function getMatchedText(
  elements: Text[],
  query: string,
  queryPatterns: QueryPattern[]
): string | undefined {
  if (elements.length === 0) {
    return undefined;
  }

  function checkContent(content: string) {
    return checkElementContent(content, query, queryPatterns);
  }

  if (elements.length === 1) {
    const elementContents = String(elements[0][CONTENTS_PROPERTY]);
    const matches = checkContent(elementContents);

    return matches ? elementContents : undefined;
  }

  const contentsList = elements
    .map((element) => element[CONTENTS_PROPERTY])
    .filter((content) => content !== null);

  if (contentsList.length === 0) {
    return undefined;
  }

  if (contentsList.length === 1) {
    const elementContents = contentsList[0];
    const matches = checkContent(elementContents);

    return matches ? elementContents : undefined;
  }

  const trimmedContents = contentsList.map((content) => content?.trim());

  const spacedContents = trimmedContents.join(" ");
  const spacedMatches = checkContent(spacedContents);

  if (spacedMatches) return spacedContents;

  const unspacedContents = trimmedContents.join("");
  const unspacedMatches = checkContent(unspacedContents);

  if (unspacedMatches) return unspacedContents;

  return undefined;
}

/**
 * Recursively crawls an element in search of a given query and returns a list
 * of matching Text nodes.
 *
 * @remarks
 * Also mutates chains of adjacent text nodes by merging them into a single
 * node and deleting all but the first. This is done in preparation of
 * replacment to support replacing text across text nodes that are beside each
 * other. See: https://github.com/dan-lovelace/word-replacer-max/issues/60.
 */
export function findText(
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  found: Text[] = []
) {
  if (element.nodeType === Node.TEXT_NODE) {
    const subsequentTextNodes = getAdjacentTextNodes(element);
    const isSubsequent = subsequentTextNodes.length > 1;

    const matchedText = getMatchedText(
      subsequentTextNodes,
      query,
      queryPatterns
    );
    const isAlreadyReplaced = Boolean(
      element.parentElement?.dataset["isReplaced"]
    );
    const isParentAllowed = !nodeNameBlocklist.has(
      String(element.parentNode?.nodeName.toLowerCase())
    );

    if (matchedText !== undefined && !isAlreadyReplaced && isParentAllowed) {
      if (isSubsequent) {
        // Override the element's content with the text that matched.
        element.textContent = matchedText;

        // Remove any following text nodes since they have been merged
        subsequentTextNodes.slice(1).forEach((node) => {
          node.remove();
        });
      }

      found.push(element as unknown as Text);
    }
  } else if (element.hasChildNodes()) {
    const childElements = Array.from(element.childNodes) as HTMLElement[];

    for (const child of childElements) {
      findText(child, query, queryPatterns, found);
    }
  }

  return found;
}
