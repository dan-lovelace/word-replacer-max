import { CONTENTS_PROPERTY, REPLACEMENT_WRAPPER_ELEMENT } from ".";

export const nodeNameBlocklist: Set<Node["nodeName"]> = new Set([
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
 * Creates a temporary element and injects the replaced text string as HTML.
 * The replacement HTML string comes in looking like this:
 * `Lorem <span>ipsum</span> dolor`.  It's then converted to an array of child
 * nodes consisting of at least one Text node and one element wrapping the
 * replacement text. The array is spread into a fragment which is then used to
 * replace the original Text node entirely.
 */
export function replaceTextNode(element: Text, html: string) {
  const { parentNode } = element;

  if (!parentNode) return;

  const wrapper = document.createElement(REPLACEMENT_WRAPPER_ELEMENT);
  wrapper.innerHTML = html;

  const fragment = document.createDocumentFragment();
  fragment.append(...wrapper.childNodes);

  const parentElement = parentNode as HTMLElement;
  parentElement.replaceChild(fragment, element);
}
