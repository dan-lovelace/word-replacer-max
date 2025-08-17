import { Storage as BrowserStorage } from "webextension-polyfill";
import { z } from "zod";

import { ApiSuggestResponseData, ToneOption } from "./api";
import { DomainEffect, ExportLink, PopupTab } from "./popup";
import { ReplacementStyle, ReplacementSuggest, RuleGroups } from "./replace";
import { Matcher, RenderRate, RuleSync } from "./rules";

export const schemaVersions = [1] as const;

export const storageVersions = [
  "1.0.0",
  "1.1.0",
  "1.1.1",
  "1.2.0",
  "1.3.0",
  "1.4.0",
] as const;

export type LocalStorage = Partial<{
  recentSuggestions: RecentSuggestions;

  /**
   * Auth keys are mapped using their respective names from Amplify. A custom
   * token provider exists to translate Amplify's version to our own.
   */
  authAccessToken: string;
  authClockDrift: string;
  authLastAuthUser: string;
  authIdToken: string;
  authRefreshToken: string;
}>;

/**
 * Suggestions data stored in local storage. It serves as a cache of API
 * responses so we can remember the results so users don't need to re-generate
 * them after closing the popup.
 */
export type RecentSuggestions = Partial<{
  [key: string]: Pick<Matcher, "identifier"> & {
    /**
     * Raw response data from the `POST:suggest` endpoint.
     */
    apiResponseData: ApiSuggestResponseData;

    /**
     * The user's tone selection in the UI. This could be different than the
     * one in the API response because they might select a different option but
     * never run the generate command. The response's tone is surfaced above
     * the list of its suggestions in the UI so the user can see which tone the
     * list is referring.
     */
    selectedTone: ToneOption;
  };
}>;

export type SchemaExport = SchemaVersion & {
  version: SchemaVersionType;
};

export type SchemaVersion = SchemaVersion1; // | SchemaVersion2 | SchemaVersion3...

export type SchemaVersionMapper = {
  1: z.ZodType<SchemaVersion1>;
};

export type SchemaVersion1 = {
  version: 1;
  data?: {
    matchers?: Omit<Matcher, "identifier">[];
  };
};

export type SchemaVersionType = (typeof schemaVersions)[number];

export type SessionStorage = Partial<{}>;

export type Storage = {
  local: LocalStorage;
  session: SessionStorage;
  sync: SyncStorage;
};

export type StorageArea = BrowserStorage.StorageArea;

export type StorageChange = BrowserStorage.StorageChange;

export type StorageChangeOf<T> = {
  newValue?: T;
  oldValue?: T;
};

export type SyncStorageKey = keyof SyncStorage;

export type StorageProvider = keyof Pick<
  BrowserStorage.Static,
  "local" | "session" | "sync"
>;

export type StorageSetOptions = {
  provider?: StorageProvider;
  onError?: (message: string) => void;
  onSuccess?: () => void;
};

export type StorageVersion = (typeof storageVersions)[number];

export type SyncStorage = Partial<{
  domainList: string[];
  exportLinks: ExportLink[];
  preferences: SyncStoragePreferences;
  replacementStyle: ReplacementStyle;
  replacementSuggest: ReplacementSuggest;
  renderRate: RenderRate;
  ruleGroups: RuleGroups;
  ruleSync: RuleSync;
  storageVersion: StorageVersion;
}>;

export type SyncStoragePreferences = {
  activeTab: PopupTab;
  domainListEffect: DomainEffect;
  extensionEnabled: boolean;
  focusRule: {
    field: keyof Pick<Matcher, "queries" | "replacement">;
    matcher: Matcher["identifier"];
  };
};
