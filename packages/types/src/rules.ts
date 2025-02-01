import { Sortable } from "./";
import { QueryPattern } from "./replace";

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

export type MatcherGroup = {
  active?: boolean;
  color: string;
  identifier: string;
  matchers?: Matcher["identifier"][];
  name: string;
};

/**
 * Matcher properties used at replacement time.
 */
export type MatcherReplaceProps = Pick<
  Matcher,
  "queryPatterns" | "replacement" | "useGlobalReplacementStyle"
>;

/**
 * A Matcher as stored in the `sync` storage area.
 */
export type MatcherGroupInSync = Record<string, MatcherGroup>;

/**
 * A Matcher as stored in the `sync` storage area.
 */
export type MatcherInSync = Record<string, Matcher>;

export type StorageMatcher = Sortable<Matcher>;

export type StorageMatcherGroup = Sortable<MatcherGroup>;
