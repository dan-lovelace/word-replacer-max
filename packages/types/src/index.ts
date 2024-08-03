import { z } from "zod";

const queryPatterns = ["case", "default", "regex", "wholeWord"] as const;
const schemaVersions = [1] as const;
const storageVersions = ["1.0.0"] as const;

export type DomainEffect = "allow" | "deny";

export type Matcher = {
  active: boolean;
  identifier: string;
  queries: string[];
  queryPatterns: QueryPattern[];
  replacement: string;
};

export type PopupTab = "domains" | "options" | "rules" | "support";

export type QueryPattern = (typeof queryPatterns)[number];

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
    matchers?: Matcher[];
  };
};

export type SchemaVersionType = (typeof schemaVersions)[number];

export type Storage = Partial<{
  [key in StorageKey]: StorageKeyMap[key];
}> & {
  storageVersion?: StorageVersionType;
};

export type StorageKey = keyof StorageKeyMap;

export type StorageKeyMap = {
  domainList: string[];
  matchers: Matcher[];
  preferences: {
    activeTab: PopupTab;
    domainListEffect: DomainEffect;
    extensionEnabled: boolean;
    focusRule: Matcher["identifier"];
  };
  storageVersion: StorageVersionType;
};

export type StorageVersionType = (typeof storageVersions)[number];
