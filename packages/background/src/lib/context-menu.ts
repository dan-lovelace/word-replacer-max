import { v4 as uuidv4 } from "uuid";

import {
  browser,
  matchersFromStorage,
  matchersToStorage,
  popoutExtension,
} from "@worm/shared/src/browser";
import { DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import {
  localStorageProvider,
  storageGetByKeys,
  storageSetByKeys,
} from "@worm/shared/src/storage";
import { QueryPattern } from "@worm/types/src/replace";

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

        const syncStorage = await storageGetByKeys();
        const { preferences, ruleSync } = syncStorage;
        const matcherStorage = ruleSync?.active
          ? syncStorage
          : await localStorageProvider.get();
        const matchers = matchersFromStorage(matcherStorage);

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
          newPreferences.focusRule = {
            field: "replacement",
            matcher: existingMatcher.identifier,
          };
        } else {
          newMatchers.push({
            active: true,
            identifier,
            queries,
            queryPatterns,
            replacement,
            useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
          });
          newPreferences.focusRule = {
            field: "replacement",
            matcher: identifier,
          };
        }

        const storageMatchers = matchersToStorage(newMatchers);

        await storageSetByKeys(storageMatchers, {
          provider: ruleSync?.active ? "sync" : "local",
        });

        newPreferences.activeTab = "rules";

        storageSetByKeys({
          preferences: newPreferences,
        });

        /**
         * Attempt to open the popup using a developmental API. Fall back to
         * opening a new window when it's not supported.
         */
        try {
          browser.action.openPopup();
        } catch (err) {
          popoutExtension(true);
        }

        break;
      }
    }
  });
}
