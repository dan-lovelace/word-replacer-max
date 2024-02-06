const allQueryPatterns = ["case", "default", "regex", "wholeWord"] as const;

export type Matcher = {
  active: boolean;
  identifier: string;
  queries: string[];
  queryPatterns: QueryPattern[];
  replacement: string;
};

export type QueryPattern = (typeof allQueryPatterns)[number];

export type Storage = Partial<{
  [key in StorageKey]: StorageKeyMap[key];
}>;

export type StorageKey = keyof StorageKeyMap;

export type StorageKeyMap = {
  domainBlocklist: string[];
  matchers: Matcher[];
};
