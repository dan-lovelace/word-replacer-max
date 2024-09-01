import { v4 as uuidv4 } from "uuid";

import {
  CURRENT_STORAGE_VERSION,
  storageGetByKeys,
  storageSetByKeys,
} from "@worm/shared";
import { DEFAULT_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { Matcher, Storage } from "@worm/types";

export async function initializeStorage() {
  const { storageVersion } = await storageGetByKeys(["storageVersion"]);

  if (storageVersion === undefined) {
    await storageSetByKeys({
      storageVersion: CURRENT_STORAGE_VERSION,
    });
  } else if (storageVersion !== CURRENT_STORAGE_VERSION) {
    // perform any necessary migrations before proceeding
  }

  const { domainList, exportLinks, matchers, preferences, replacementStyle } =
    await storageGetByKeys([
      "domainList",
      "exportLinks",
      "matchers",
      "preferences",
      "replacementStyle",
    ]);

  const initialStorage: Storage = {};

  if (domainList === undefined) {
    initialStorage.domainList = ["docs.google.com", "github.com"];
  }

  if (exportLinks === undefined) {
    initialStorage.exportLinks = [];
  }

  if (matchers === undefined) {
    const defaultMatchers: Matcher[] = [
      {
        active: true,
        identifier: uuidv4(),
        queries: ["my jaw dropped", "I was shocked"],
        queryPatterns: [],
        replacement: "I was surprised",
        useGlobalReplacementStyle: true,
      },
      {
        active: true,
        identifier: uuidv4(),
        queries: ["This."],
        queryPatterns: ["case", "wholeWord"],
        replacement: " ",
        useGlobalReplacementStyle: true,
      },
    ];

    initialStorage.matchers = defaultMatchers;
  }

  if (preferences === undefined) {
    initialStorage.preferences = {
      activeTab: "rules",
      domainListEffect: "deny",
      extensionEnabled: true,
      focusRule: "",
    };
  }

  if (replacementStyle === undefined) {
    initialStorage.replacementStyle = DEFAULT_REPLACEMENT_STYLE;
  }

  await storageSetByKeys(initialStorage);
}
