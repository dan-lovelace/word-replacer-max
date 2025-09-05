import {
  ReplacementStyle,
  VueNodeInfo,
} from "@wordreplacermax/types/src/replace";
import { Matcher } from "@wordreplacermax/types/src/rules";

import { CONTENTS_PROPERTY, REPLACEMENT_WRAPPER_ELEMENT } from "./";

export const nodeNameBlocklist: Set<Node["nodeName"]> = new Set([
  "img",
  "link",
  "meta",
  "noscript",
  "script",
  "style",
  "svg",
  "textarea",
  "video",
]);

/**
 * Gets the HTML necessary to inject back into a target element once its text
 * has been replaced. Replacement HTML may include new elements around the
 * replaced text in order to keep track of what's already been modified. This
 * is necessary to avoid recursive replacements and could be used as a CSS
 * selector if they ever need style.
 */
export function getReplacementHTML(
  targetElement: Text,
  query: string,
  matcher: Pick<Matcher, "replacement" | "useGlobalReplacementStyle">,
  replacementStyle: ReplacementStyle | undefined
) {
  const { replacement, useGlobalReplacementStyle } = matcher;

  if (targetElement.parentElement?.nodeName === "TITLE") {
    return replacement;
  }

  const now = new Date().getTime().toString();
  const wrapper = document.createElement(REPLACEMENT_WRAPPER_ELEMENT);
  wrapper[CONTENTS_PROPERTY] = replacement;
  wrapper.dataset["isReplaced"] = now;
  wrapper.dataset["query"] = query;

  if (Boolean(useGlobalReplacementStyle)) {
    styleReplacement(wrapper, replacementStyle);
  }

  return wrapper.outerHTML;
}

/**
 * Applies classnames to a replacement element based on enabled options.
 */
export function styleReplacement(
  element: HTMLElement,
  replacementStyle: ReplacementStyle | undefined
) {
  if (!replacementStyle?.active) return;

  for (const option of replacementStyle.options ?? []) {
    element.classList.add(`wrm-style__${option}`);
  }
}

/**
 * Creates a temporary element and injects the replaced text string as HTML.
 * The replacement HTML string comes in looking like this:
 * `Lorem <span>ipsum</span> dolor`. It's then converted to an array of child
 * nodes consisting of at least one Text node and one element wrapping the
 * replacement text. The array is spread into a fragment which is then used to
 * replace the original Text node entirely.
 */
export function replaceTextNode(element: Text, html: string) {
  const { parentNode } = element;

  if (!parentNode) return;

  const parentElement = parentNode as HTMLElement;

  const vueInfo = getVueNodeInfo(element);
  if (vueInfo.isVueManaged) {
    return replaceVueNode(vueInfo, parentElement, element, html);
  }

  const wrapper = document.createElement(REPLACEMENT_WRAPPER_ELEMENT);
  wrapper.innerHTML = html;

  const fragment = document.createDocumentFragment();
  fragment.append(...wrapper.childNodes);

  parentElement.replaceChild(fragment, element);
}

/**
 * Detects if a node is managed by Vue by checking for SSR comment markers.
 */
export function getVueNodeInfo(node: Node): VueNodeInfo {
  const markers: Comment[] = [];
  let current: Node | null = node;

  // check immediate siblings for vue comment markers
  while (current) {
    if (current.nodeType === Node.COMMENT_NODE) {
      const comment = current as Comment;

      if (comment.textContent === "[" || comment.textContent === "]") {
        markers.push(comment);
      }
    }

    current = current.previousSibling;
  }

  current = node.nextSibling;
  while (current) {
    if (current.nodeType === Node.COMMENT_NODE) {
      const comment = current as Comment;

      if (comment.textContent === "[" || comment.textContent === "]") {
        markers.push(comment);
      }
    }

    current = current.nextSibling;
  }

  return {
    isVueManaged: markers.length > 0,
    commentMarkers: markers,
  };
}

/**
 * Replaces a node managed by Vue. It performs replacements while preserving
 * SSR comment markers.
 *
 * @see https://github.com/dan-lovelace/word-replacer-max/issues/31
 */
export function replaceVueNode(
  vueInfo: VueNodeInfo,
  parentElement: HTMLElement,
  element: Text,
  html: string
) {
  const wrapper = document.createElement(REPLACEMENT_WRAPPER_ELEMENT);
  wrapper.innerHTML = html;

  const fragment = document.createDocumentFragment();

  // preserve any leading vue comments
  const previousComments = Array.from(vueInfo.commentMarkers).filter(
    (comment) =>
      element.compareDocumentPosition(comment) &
      Node.DOCUMENT_POSITION_PRECEDING
  );
  previousComments.forEach((comment) => {
    fragment.appendChild(comment.cloneNode(true));
  });

  // add replaced content
  fragment.append(...wrapper.childNodes);

  // preserve any trailing vue comments
  const followingComments = Array.from(vueInfo.commentMarkers).filter(
    (comment) =>
      element.compareDocumentPosition(comment) &
      Node.DOCUMENT_POSITION_FOLLOWING
  );
  followingComments.forEach((comment) => {
    fragment.appendChild(comment.cloneNode(true));
  });

  // replace the original element with new fragment
  parentElement.replaceChild(fragment, element);
}
