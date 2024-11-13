import { merge } from "ts-deepmerge";

import { MatcherInSync } from "@worm/types/src/rules";

export const TEST_MATCHER_ID_1 = "matcher__1234";
export const TEST_MATCHER_ID_2 = "matcher__5678";

export const testRules: MatcherInSync = {
  [TEST_MATCHER_ID_1]: {
    active: true,
    identifier: "1234",
    queries: ["my jaw dropped", "I was shocked"],
    queryPatterns: [],
    replacement: "I was surprised",
  },
  [TEST_MATCHER_ID_2]: {
    active: true,
    identifier: "5678",
    queries: ["This."],
    queryPatterns: ["case", "wholeWord"],
    replacement: " ",
  },
};

export const generateMatchers = (overrides: MatcherInSync = {}) =>
  merge(testRules, overrides);
