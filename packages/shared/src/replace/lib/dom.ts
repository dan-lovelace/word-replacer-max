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

export function replaceTextNode(element: Text, html: string) {
  const { parentNode } = element;

  if (!parentNode) return;

  const parentElement = parentNode as HTMLElement;

  /**
   * Create an ephemeral element and inject the replaced text string as HTML.
   * The string comes in as `Lorem <span>ipsum</span> dolor`
   */
  const wrapper = document.createElement(REPLACEMENT_WRAPPER_ELEMENT);
  wrapper.innerHTML = html;

  const fragment = document.createDocumentFragment();
  fragment.append(...wrapper.childNodes);

  parentElement.replaceChild(fragment, element);
}
