import { QueryPattern } from "@worm/types/src/replace";

import { CONTENTS_PROPERTY } from "./lib";
import { nodeNameBlocklist } from "./lib/dom";
import { getRegexFlags, patternRegex } from "./lib/regex";

function checkContainsText(
  content: string,
  queryPatterns: QueryPattern[],
  query: string
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
 * Recursively crawls an element in search of a given query and returns a list
 * of matching Text nodes. Also mutates chains of adjacent text nodes
 */
export function findText(
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  found: Text[] = []
) {
  if (element.nodeType === Node.TEXT_NODE) {
    const subsequentTextNodes = getAdjacentTextNodes(element);

    const combinedContent = subsequentTextNodes
      .map((node) => {
        const nodeContent = String(node[CONTENTS_PROPERTY]);

        return subsequentTextNodes.length > 1
          ? nodeContent.trim()
          : nodeContent;
      })
      .join(" ");

    if (
      checkContainsText(combinedContent, queryPatterns, query) &&
      !element.parentElement?.dataset["isReplaced"] &&
      !nodeNameBlocklist.has(String(element.parentNode?.nodeName.toLowerCase()))
    ) {
      // Update the element's text content
      element.textContent = combinedContent;

      // Remove any following text nodes since they have been merged
      if (subsequentTextNodes.length > 1) {
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
