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
  const lastReplaced = (element as HTMLElement).dataset["wormReplaced"];

  if (lastReplaced !== undefined && lastReplaced === element.value) return;

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
  (element as HTMLElement).dataset["wormReplaced"] = value;
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
