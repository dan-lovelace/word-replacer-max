import { merge } from "ts-deepmerge";

import { MatcherGroupInSync, MatcherInSync } from "@worm/types/src/rules";

export const TEST_GROUP_ID_1 = "group__1234";
export const TEST_GROUP_ID_2 = "group__5678";

export const TEST_MATCHER_ID_1 = "matcher__1234";
export const TEST_MATCHER_ID_2 = "matcher__5678";

export const testRuleGroups: MatcherGroupInSync = {
  [TEST_GROUP_ID_1]: {
    active: false,
    color: "blue",
    identifier: "1234",
    matchers: [],
    name: "Test Group 1",
  },
  [TEST_GROUP_ID_2]: {
    active: false,
    color: "green",
    identifier: "5678",
    matchers: [],
    name: "Test Group 2",
  },
};

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

export const generateMatcherGroups = (overrides: MatcherGroupInSync = {}) =>
  merge(testRuleGroups, overrides);

export const generateMatchers = (overrides: MatcherInSync = {}) =>
  merge(testRules, overrides);
