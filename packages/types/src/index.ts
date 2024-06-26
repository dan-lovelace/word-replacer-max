import { z } from "zod";

const allQueryPatterns = ["case", "default", "regex", "wholeWord"] as const;
export const schemaVersions = [1] as const;

export type DomainEffect = "allow" | "deny";

export type Matcher = {
  active: boolean;
  identifier: string;
  queries: string[];
  queryPatterns: QueryPattern[];
  replacement: string;
};

export type PopupTab = "domains" | "options" | "rules" | "support";

export type QueryPattern = (typeof allQueryPatterns)[number];

export type Storage = Partial<{
  [key in StorageKey]: StorageKeyMap[key];
}>;

export type StorageKey = keyof StorageKeyMap;

export type StorageKeyMap = {
  domainList: string[];
  matchers: Matcher[];
  preferences: {
    activeTab: PopupTab;
    domainListEffect: DomainEffect;
    extensionEnabled: boolean;
  };
};

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
