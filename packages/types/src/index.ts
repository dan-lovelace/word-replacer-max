import { z } from "zod";

import { ApiAuthTokensResponse } from "./api";

const queryPatterns = ["case", "default", "regex", "wholeWord"] as const;
const schemaVersions = [1] as const;
const storageVersions = ["1.0.0"] as const;

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
};

export type PopupAlertSeverity = "danger" | "info" | "success";

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
  storageVersion?: StorageVersion;
};

export type StorageKey = keyof StorageKeyMap;

export type StorageKeyMap = {
  authentication: {
    tokens: ApiAuthTokensResponse;
  };
  domainList: string[];
  exportLinks: ExportLink[];
  matchers: Matcher[];
  preferences: {
    activeTab: PopupTab;
    domainListEffect: DomainEffect;
    extensionEnabled: boolean;
    focusRule: Matcher["identifier"];
  };
  storageVersion: StorageVersion;
};

export type StorageSetOptions = {
  onError?: (message: string) => void;
  onSuccess?: () => void;
};

export type StorageVersion = (typeof storageVersions)[number];

export interface WebAppMessage<T extends WebAppMessageKind>
  extends MessageEvent {
  data: {
    kind: T;
    details: WebAppMessageKindMap[T];
  };
}

export type WebAppMessageData<T extends WebAppMessageKind> =
  WebAppMessage<T>["data"];

export type WebAppMessageKind = keyof WebAppMessageKindMap;

export type WebAppMessageKindMap = {
  authTokens: ApiAuthTokensResponse;
  contentInitialize: boolean;
  pingRequest: WebAppPingRequest;
  pingResponse: WebAppPingResponse;
};

export type WebAppPingRequest = undefined;

export type WebAppPingResponse = boolean;

export * from "./api";
