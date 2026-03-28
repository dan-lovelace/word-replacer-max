import { ReplacementStyle } from "@worm/types/src/replace";
import { Matcher } from "@worm/types/src/rules";

import { isReplacementEmpty, getSortedQueryPatterns } from "./lib";
import { getRegexFlags, patternRegex } from "./lib/regex";

/**
 * Selectors for elements whose text content is replaced via their `.value`
 * property rather than inner HTML.
 */
const VALUE_INPUT_SELECTOR = [
  'input[type="email"]',
  'input[type="search"]',
  'input[type="tel"]',
  'input[type="text"]',
  'input[type="url"]',
  "input:not([type])",
  "textarea",
].join(", ");

/**
 * Selectors for elements that accept rich text input via `innerHTML`.
 */
const CONTENTEDITABLE_SELECTOR =
  '[contenteditable="true"], [contenteditable=""]';

/**
 * Applies a single matcher's queries to a plain string value and returns the
 * result. No HTML wrapping is applied, this is for `.value` replacements.
 */
function applyQueryReplacement(
  value: string,
  query: string,
  matcher: Matcher
): string {
  const { queryPatterns, replacement } = matcher;

  if (isReplacementEmpty(replacement)) return value;

  if (!queryPatterns || queryPatterns.length < 1) {
    return value.replace(patternRegex.default(query), replacement);
  }

  const sortedPatterns = getSortedQueryPatterns(queryPatterns);
  let result = value;

  for (const pattern of sortedPatterns) {
    switch (pattern) {
      case "case":
      case "default": {
        result = result.replace(patternRegex[pattern](query), replacement);
        break;
      }

      case "regex": {
        result = result.replace(
          patternRegex.regex(query, getRegexFlags(queryPatterns)),
          replacement
        );
        break;
      }

      case "wholeWord": {
        result = result.replace(
          patternRegex.wholeWord(query, getRegexFlags(queryPatterns)),
          replacement
        );
        break;
      }
    }
  }

  return result;
}

/**
 * Replaces the `.value` of a text input or textarea with plain-text
 * replacements. Cursor position is preserved by adjusting for the length delta
 * of each replacement.
 */
export function replaceInputValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  matchers: Matcher[]
) {
  const selectionStart = element.selectionStart ?? 0;
  const selectionEnd = element.selectionEnd ?? 0;

  let value = element.value;

  for (const matcher of matchers) {
    if (matcher.active !== true) continue;

    for (const query of matcher.queries) {
      value = applyQueryReplacement(value, query, matcher);
    }
  }

  if (value === element.value) return;

  const delta = value.length - element.value.length;

  element.value = value;
  element.setSelectionRange(selectionStart + delta, selectionEnd + delta);
}

/**
 * Saves the caret position inside a contenteditable element as a plain-text
 * character offset, executes `fn`, then restores the caret adjusted for the
 * text-length delta introduced by `fn`.
 *
 * Cursor restoration is aware of `[data-is-replaced]` spans: if the adjusted
 * offset lands inside one of those spans, the caret is placed *after* the span
 * element instead of inside it. This prevents subsequent keystrokes from
 * expanding the replacement span rather than appending new text outside it.
 *
 * Using `element.ownerDocument.defaultView` for the selection means this works
 * correctly for both main-document contenteditable elements and for contenteditable
 * elements inside cross-context iframes (where `document.getSelection()` would
 * return the wrong selection object).
 */
export function replaceEditableValue(element: HTMLElement, fn: () => void) {
  const win = element.ownerDocument.defaultView;

  if (!win) {
    fn();
    return;
  }

  const selection = win.getSelection();

  if (!selection || selection.rangeCount === 0) {
    fn();
    return;
  }

  const range = selection.getRangeAt(0);

  // measure cursor offset as plain-text character count from start of element
  const preStart = range.cloneRange();
  preStart.selectNodeContents(element);
  preStart.setEnd(range.startContainer, range.startOffset);
  const startOffset = preStart.toString().length;

  const lengthBefore = element.textContent?.length ?? 0;

  fn();

  const delta = (element.textContent?.length ?? 0) - lengthBefore;
  const targetOffset = Math.max(0, startOffset + delta);

  restoreCaretAfterReplacement(element, targetOffset, win);
}

/**
 * Places the caret at `targetOffset` plain-text characters from the start of
 * `element`. `[data-is-replaced]` spans are treated as opaque units: their
 * character length is counted normally, but if the target falls inside one the
 * caret is placed immediately after the span element so that subsequent typing
 * continues outside it.
 */
function restoreCaretAfterReplacement(
  element: HTMLElement,
  targetOffset: number,
  win: Window
): void {
  const selection = win.getSelection();
  if (!selection) return;

  const doc = element.ownerDocument;
  const newRange = doc.createRange();
  let charIndex = 0;
  let placed = false;

  function walk(node: Node): void {
    if (placed) return;

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      if (el.dataset["isReplaced"] !== undefined) {
        /**
         * Count the span's text as a unit; place cursor after it if target
         * falls within its range rather than stepping into the span's
         * children.
         */
        const len = el.textContent?.length ?? 0;

        if (charIndex + len >= targetOffset) {
          const parent = el.parentNode!;
          const idx = Array.from(parent.childNodes).findIndex((n) => n === el);
          newRange.setStart(parent, idx + 1);
          newRange.setEnd(parent, idx + 1);
          placed = true;
        } else {
          charIndex += len;
        }

        return;
      }

      for (const child of Array.from(node.childNodes)) {
        walk(child);
        if (placed) break;
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length ?? 0;

      if (charIndex + len >= targetOffset) {
        const offset = targetOffset - charIndex;
        newRange.setStart(node, offset);
        newRange.setEnd(node, offset);
        placed = true;
      } else {
        charIndex += len;
      }
    }
  }

  walk(element);

  if (placed) {
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

/**
 * Applies replacements to all input-type elements within the given root:
 *
 * - Text `<input>` elements and `<textarea>` elements: replaced via `.value`
 *   (no HTML wrapping to avoid injecting spans into field values).
 * - `contenteditable` elements: replaced via the standard HTML mechanism using
 *   the provided `replaceElement` callback, which preserves the existing
 *   span-based deduplication.
 * - Editable `<iframe>` documents: replaced via the provided `replaceAll`
 *   callback on the iframe's document.
 */
export function replaceInputElements(
  matchers: Matcher[],
  replacementStyle: ReplacementStyle | undefined,
  root: Document | HTMLElement = document,
  callbacks: {
    replaceElement: (
      element: HTMLElement,
      matchers: Matcher[],
      replacementStyle: ReplacementStyle | undefined
    ) => void;
  }
) {
  const activeMatchers = matchers.filter((m) => m.active);
  if (activeMatchers.length < 1) return;

  // value-based inputs (input, textarea)
  const valueInputs = Array.from(
    root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      VALUE_INPUT_SELECTOR
    )
  );

  for (const el of valueInputs) {
    replaceInputValue(el, activeMatchers);
  }

  // contenteditable elements, use innerHTML / span-based mechanism
  const editableElements = Array.from(
    root.querySelectorAll<HTMLElement>(CONTENTEDITABLE_SELECTOR)
  );

  for (const el of editableElements) {
    callbacks.replaceElement(el, activeMatchers, replacementStyle);
  }

  // editable iframes
  const iframes = Array.from(
    root.querySelectorAll<HTMLIFrameElement>("iframe")
  );

  for (const iframe of iframes) {
    try {
      const doc = iframe.contentDocument;

      if (!doc) continue;

      const isDesignMode = doc.designMode === "on";
      const isBodyEditable = doc.body?.isContentEditable === true;

      if (isDesignMode || isBodyEditable) {
        callbacks.replaceElement(doc.body, activeMatchers, replacementStyle);
      }
    } catch {
      // cross-origin iframes will throw, skip silently
    }
  }
}
