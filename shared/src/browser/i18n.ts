import {
  BrowserMessageItem,
  BrowserMessageKey,
} from "@wordreplacermax/types/src/i18n";

import { browser } from "./browser";

const cache = new Map<BrowserMessageKey, BrowserMessageItem["message"]>();

function getMessage(key: BrowserMessageKey, substitutions?: string[]): string {
  const cached = cache.get(key);

  if (cached !== undefined) {
    return cached;
  }

  const result = browser.i18n.getMessage(key, substitutions);

  if (result === undefined) {
    throw new Error(
      `Message name is not a string or more than 9 substitutions were passed. Received substitutions: ${(
        substitutions ?? []
      ).join(", ")}`
    );
  }

  if (result === "") {
    throw new Error(`Message does not exist for key: ${key}`);
  }

  cache.set(key, result);

  return result;
}

// utility method short for "translate"
export const t = getMessage;

export default {
  ...browser.i18n,
  getMessage,
};
