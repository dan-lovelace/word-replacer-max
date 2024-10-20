import { z } from "zod";

const identificationErrorMessages: Record<IdentificationErrorName, string> = {
  MissingTokens: "Update requires tokens",
  Standard: "Unable to identify user",
  UserNotLoggedIn: "User is not logged in",
};
const queryPatterns = ["case", "default", "regex", "wholeWord"] as const;
const schemaVersions = [1] as const;

export const storageVersions = ["1.0.0", "1.1.0", "1.1.1"] as const;

export type AppUser =
  | {
      email: string;
    }
  | false;

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

export class IdentificationError extends Error {
  constructor(name: IdentificationErrorName = "Standard") {
    super(identificationErrorMessages[name]);
    this.name = name;

    Object.setPrototypeOf(this, IdentificationError.prototype);
  }
}

type IdentificationErrorName = "MissingTokens" | "Standard" | "UserNotLoggedIn";

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

export type ReplacementSuggest = Partial<{
  active: boolean;
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
    matchers?: Matcher[];
  };
};

export type SchemaVersionType = (typeof schemaVersions)[number];

export type SignInStatusState =
  | "signedIn"
  | "signedOut"
  | "signingIn"
  | "signingOut"
  | "unknown";

export type Storage = Partial<{
  [key in StorageKey]: StorageKeyMap[key];
}> & {
  storageVersion?: StorageVersion;
};

export type StorageKey = keyof StorageKeyMap;

export type StorageKeyMap = {
  /**
   * Auth keys are mapped using their respective names from Amplify. A custom
   * token provider exists to translate Amplify's version to our own.
   */
  authAccessToken: string;
  authClockDrift: string;
  authLastAuthUser: string;
  authIdToken: string;
  authRefreshToken: string;

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
  replacementSuggest: ReplacementSuggest;
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

export type WebAppPingResponse = boolean;

export * from "./api";
