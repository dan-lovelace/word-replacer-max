import { z } from "zod";

const queryPatterns = ["case", "default", "regex", "wholeWord"] as const;
const schemaVersions = [1] as const;

export const storageVersions = ["1.0.0", "1.1.0", "1.1.1"] as const;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type DomainEffect = "allow" | "deny";

export type ExportLink = {
  identifier: ReturnType<Date["getTime"]>;
  url: string;
};

export type Matcher = {
  active: boolean;
  identifier: string;
  queries: string[];
  queryPatterns: QueryPattern[];
  replacement: string;

  /**
   * NEW: Introduced during styled replacements, the optional flag should be
   * removed at a later time.
   */
  useGlobalReplacementStyle?: boolean;
};

/**
 * Matcher properties used at replacement time.
 */
export type MatcherReplaceProps = Pick<
  Matcher,
  "queryPatterns" | "replacement" | "useGlobalReplacementStyle"
>;

/**
 * PCRE case modes for use in regex replacements.
 */
export type PCRECaseMode = "lower" | "title" | "upper" | null;

export type PopupAlertSeverity = "danger" | "info" | "success";

export type PopupTab = "domains" | "options" | "rules" | "support";

export type QueryPattern = (typeof queryPatterns)[number];

export type ReplacementStyle = Partial<{
  active: boolean;
  backgroundColor: string;
  color: string;
  options: ReplacementStyleOption[];
}>;

export type ReplacementStyleOption =
  | "backgroundColor"
  | "bold"
  | "color"
  | "italic"
  | "strikethrough"
  | "underline";

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
  storageVersion?: StorageVersion;
};

export type StorageKey = keyof StorageKeyMap;

export type StorageKeyMap = {
  domainList: string[];
  exportLinks: ExportLink[];
  matchers: Matcher[];
  preferences: {
    activeTab: PopupTab;
    domainListEffect: DomainEffect;
    extensionEnabled: boolean;
    focusRule: Matcher["identifier"];
  };
  replacementStyle: ReplacementStyle;
  storageVersion: StorageVersion;
};

export type StorageSetOptions = {
  onError?: (message: string) => void;
  onSuccess?: () => void;
};

export type StorageVersion = (typeof storageVersions)[number];

export type SystemColor =
  | "black"
  | "blue"
  | "blueGray"
  | "cyan"
  | "green"
  | "orange"
  | "pink"
  | "red"
  | "white"
  | "yellow";

export * from "./api";
