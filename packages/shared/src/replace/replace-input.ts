import { Matcher } from "@worm/types/src/rules";

import { replaceEditable, ReplaceTextOptions } from ".";
import { isReplacementEmpty, getSortedQueryPatterns, hashValue } from "./lib";
import { getRegexFlags, patternRegex } from "./lib/regex";

const LAST_VALUE_DATA_KEY = "wrmLastValue";

const VALUE_INPUT_SELECTOR = [
  'input[type="email"]',
  'input[type="search"]',
  'input[type="tel"]',
  'input[type="text"]',
  'input[type="url"]',
  "input:not([type])",
  "textarea",
].join(", ");

const EDITABLE_HTML_SELECTOR = '[contenteditable="true"], [contenteditable=""]';

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

function replaceInputValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  matchers: Matcher[]
) {
  const valueProperty: keyof Pick<HTMLInputElement, "value"> = "value";
  const lastReplaced = (element as HTMLElement).dataset[LAST_VALUE_DATA_KEY];

  if (
    lastReplaced !== undefined &&
    lastReplaced === hashValue(element[valueProperty])
  )
    return;

  let value = element[valueProperty];

  for (const matcher of matchers) {
    if (matcher.active !== true) continue;

    for (const query of matcher.queries) {
      value = applyQueryReplacement(value, query, matcher);
    }
  }

  if (value === element[valueProperty]) return;

  element[valueProperty] = value;
  (element as HTMLElement).dataset[LAST_VALUE_DATA_KEY] = hashValue(value);
}

export function replaceAllInputElements(
  matchers: Matcher[],
  root: Document | HTMLElement = document,
  options: ReplaceTextOptions = {}
) {
  const activeMatchers = matchers.filter((m) => m.active);
  if (activeMatchers.length < 1) return;

  const valueInputs = Array.from(
    root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      VALUE_INPUT_SELECTOR
    )
  );

  for (const el of valueInputs) {
    replaceInputValue(el, activeMatchers);
  }

  const editableHTMLElements = Array.from(
    root.querySelectorAll<HTMLElement>(EDITABLE_HTML_SELECTOR)
  );

  for (const el of editableHTMLElements) {
    replaceEditable(matchers, options, el);
  }

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
        replaceEditable(matchers, options, doc.body);
      }
    } catch {
      // cross-origin iframes will throw, skip silently
    }
  }
}
