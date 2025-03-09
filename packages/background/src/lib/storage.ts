import { v4 as uuidv4 } from "uuid";

import {
  matchersFromStorage,
  matchersToStorage,
} from "@worm/shared/src/browser";
import { DEFAULT_RULE_SYNC } from "@worm/shared/src/replace/lib/rule-sync";
import { DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import {
  BASELINE_STORAGE_VERSION,
  getStorageProvider,
  localStorageProvider,
  runStorageMigrations,
} from "@worm/shared/src/storage";
import { Matcher, RuleSync } from "@worm/types/src/rules";
import { SyncStorage } from "@worm/types/src/storage";

const syncStorageProvider = getStorageProvider("sync");

export async function initializeStorage() {
  const { ruleSync: storedRuleSync, storageVersion } =
    (await syncStorageProvider.get([
      "ruleSync",
      "storageVersion",
    ])) as SyncStorage;

  const ruleSync: RuleSync = storedRuleSync ?? DEFAULT_RULE_SYNC;
  const isRuleSyncActive = ruleSync.active;
  const matcherStorageProvider = isRuleSyncActive
    ? syncStorageProvider
    : localStorageProvider;

  if (ruleSync === undefined) {
    await syncStorageProvider.set({
      ruleSync,
    });
  }

  if (storageVersion === undefined) {
    await syncStorageProvider.set({
      storageVersion: BASELINE_STORAGE_VERSION,
    });
  }

  const syncStorage = await syncStorageProvider.get();
  const { domainList, exportLinks, preferences } = syncStorage;

  const initialStorage: SyncStorage = {};

  if (domainList === undefined) {
    initialStorage.domainList = ["docs.google.com", "github.com"];
  }

  if (exportLinks === undefined) {
    initialStorage.exportLinks = [];
  }

  const matchers = isRuleSyncActive
    ? matchersFromStorage(syncStorage)
    : matchersFromStorage(await localStorageProvider.get());

  if (matchers === undefined) {
    const defaultMatchers: Matcher[] = [
      {
        active: true,
        identifier: uuidv4(),
        queries: ["awesome", "amazing", "insane"],
        queryPatterns: [],
        replacement: "wonderful",
        useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
      },
      {
        active: true,
        identifier: uuidv4(),
        queries: ["color"],
        queryPatterns: ["wholeWord"],
        replacement: "colour",
        useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
      },
    ];

    await matcherStorageProvider.set(matchersToStorage(defaultMatchers));
  }

  if (preferences === undefined) {
    initialStorage.preferences = {
      activeTab: "rules",
      domainListEffect: "deny",
      extensionEnabled: true,
      focusRule: {
        field: "replacement",
        matcher: "",
      },
    };
  }

  await syncStorageProvider.set(initialStorage);
  await runStorageMigrations();
}
