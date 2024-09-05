import { v4 as uuidv4 } from "uuid";

import {
  browser,
  popoutExtension,
  storageGetByKeys,
  storageSetByKeys,
} from "@worm/shared/src/browser";
import { QueryPattern } from "@worm/types";

const ADD_NEW_RULE_ID = "add-new-rule";

export function initializeContextMenu() {
  browser.contextMenus.create({
    id: ADD_NEW_RULE_ID,
    title: 'Replace "%s"',
    contexts: ["selection"],
  });
}

export function startContextMenuListener() {
  browser.contextMenus.onClicked.addListener(async (info) => {
    switch (info.menuItemId) {
      case ADD_NEW_RULE_ID: {
        const { selectionText } = info;
        const trimmed = selectionText?.trim();

        if (!trimmed || trimmed.length < 1) break;

        const { matchers, preferences } = await storageGetByKeys([
          "matchers",
          "preferences",
        ]);

        const queries = [trimmed];
        const queryPatterns: QueryPattern[] = [];
        const replacement = "";

        /**
         * Check for existing rules that have the same selection text but all
         * other defaults. This avoids a situation where the popup window
         * doesn't open automatically and the user inadvertently adding
         * duplicates.
         */
        const existingMatcher = matchers?.find(
          (matcher) =>
            matcher.queries.length === queries.length &&
            matcher.queries.every((query) => queries.includes(query)) &&
            matcher.queryPatterns.length === queryPatterns.length &&
            matcher.queryPatterns.every((queryPattern) =>
              queryPatterns.includes(queryPattern)
            ) &&
            matcher.replacement === replacement
        );

        const newPreferences = Object.assign({}, preferences);
        const identifier = uuidv4();
        const newMatchers = [...(matchers ?? [])];

        if (existingMatcher) {
          newPreferences.focusRule = existingMatcher.identifier;
        } else {
          newMatchers.push({
            active: true,
            identifier,
            queries,
            queryPatterns,
            replacement,
            useGlobalReplacementStyle: true,
          });
          newPreferences.focusRule = identifier;
        }

        newPreferences.activeTab = "rules";

        storageSetByKeys({
          matchers: newMatchers,
          preferences: newPreferences,
        });

        /**
         * Attempt to open the popup using a developmental API. Fall back to
         * opening a new window when it's not supported.
         */
        try {
          browser.action.openPopup();
        } catch (err) {
          popoutExtension();
        }

        break;
      }
    }
  });
}
