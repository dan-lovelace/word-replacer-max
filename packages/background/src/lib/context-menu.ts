import { v4 as uuidv4 } from "uuid";

import {
  browser,
  logDebug,
  storageGetByKeys,
  storageSetByKeys,
} from "@worm/shared";
import { Matcher } from "@worm/types";

const ADD_NEW_RULE_ID = "add-new-rule";

export function initializeContextMenu() {
  browser.contextMenus.create({
    id: ADD_NEW_RULE_ID,
    title: 'Replace "%s"',
    contexts: ["selection"],
  });

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

        newPreferences.focusRule = identifier;

        storageSetByKeys({
          matchers: newMatchers,
          preferences: newPreferences,
        });

        /**
         * Attempt to open the popup. This is not widely supported at this
         * time.
         */
        browser.action
          .openPopup()
          .catch((err) => logDebug("Error opening popup", err));

        break;
      }
    }
  });
}
