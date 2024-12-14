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
export type MatcherInSync = Record<string, Matcher>;

export type StorageMatcher = Matcher & {
  sortIndex?: number;
};
