import { v4 as uuidv4 } from "uuid";

import {
  browser,
  popoutExtension,
  storageGetByKeys,
  storageSetByKeys,
} from "@worm/shared/src/browser";
import { Matcher } from "@worm/types";

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

        if (!selectionText) break;

        const { matchers, preferences } = await storageGetByKeys([
          "matchers",
          "preferences",
        ]);
        const newPreferences = Object.assign({}, preferences);
        const identifier = uuidv4();
        const newMatchers: Matcher[] = [
          ...(matchers ?? []),
          {
            active: true,
            identifier,
            queries: [selectionText],
            queryPatterns: [],
            replacement: "",
          },
        ];

        newPreferences.activeTab = "rules";
        newPreferences.focusRule = identifier;

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
