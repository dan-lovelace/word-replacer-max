import { expect } from "@jest/globals";

import {
  matchersFromStorage,
  matchersToStorage,
} from "@worm/shared/src/browser/matchers";
import { Matcher } from "@worm/types/src/rules";

import { DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE } from "../src/replace/lib/style";

jest.mock("@worm/shared/src/config/values", () => ({
  VITE_API_ORIGIN: "https://dev-api.wordreplacermax.com",
}));

describe("matchersToStorage", () => {
  const testMatchers: Matcher[] = [
    {
      active: true,
      identifier: "b7fce47e-58e8-4409-adf4-08da053e713d",
      queries: ["my jaw dropped", "I was shocked"],
      queryPatterns: [],
      replacement: "I was surprised",
      useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
    },
    {
      active: true,
      identifier: "34eb8c78-402e-4006-b5a9-b1b15af7a037",
      queries: ["This.", "literally"],
      queryPatterns: ["case", "wholeWord"],
      replacement: "",
      useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
    },
  ];

  it("converts an array of matchers to a shape acceptable for storage", () => {
    expect(matchersToStorage(testMatchers)).toMatchSnapshot();
  });
});

describe("matchersFromStorage", () => {
  it("converts a raw storage object's matchers to a shape expected by the rest of the system", () => {
    const testStorage = {
      "matcher__b7fce47e-58e8-4409-adf4-08da053e713d": {
        active: true,
        identifier: "b7fce47e-58e8-4409-adf4-08da053e713d",
        queries: ["my jaw dropped", "I was shocked"],
        queryPatterns: [],
        replacement: "I was surprised",
      },
      "matcher__34eb8c78-402e-4006-b5a9-b1b15af7a037": {
        active: true,
        identifier: "34eb8c78-402e-4006-b5a9-b1b15af7a037",
        queries: ["This.", "literally"],
        queryPatterns: ["case", "wholeWord"],
        replacement: "",
      },
    };

    expect(matchersFromStorage(testStorage)).toMatchSnapshot();
  });

  it("returns matchers in the correct order", () => {
    const testStorage = {
      // object keys are sorted by name in storage
      matcher__000: {
        active: true,
        identifier: "000",
        queries: ["This.", "literally"],
        queryPatterns: ["case", "wholeWord"],
        replacement: "",
        // sort index is different than location in storage
        sortIndex: 1,
      },
      matcher__001: {
        active: true,
        identifier: "001",
        queries: ["my jaw dropped", "I was shocked"],
        queryPatterns: [],
        replacement: "I was surprised",
        sortIndex: 0,
      },
    };

    expect(matchersFromStorage(testStorage)).toMatchSnapshot();
  });

  it("gracefully handles misconfigured stored legacy matchers", () => {
    // create an invalid legacy matcher; notice the missing `identifier` key
    const invalidLegacyMatcher: Omit<Matcher, "identifier"> = {
      active: true,
      queries: ["my jaw dropped", "I was shocked"],
      queryPatterns: [],
      replacement: "I was surprised",
    };

    // also provide a valid legacy matcher
    const validLegacyMatcher: Matcher = {
      active: true,
      identifier: "34eb8c78-402e-4006-b5a9-b1b15af7a037",
      queries: ["This.", "literally"],
      queryPatterns: ["case", "wholeWord"],
      replacement: "",
    };

    // provide a valid matcher with the new structure to make sure it's preserved
    const newMatcherIdentifier = "1234";
    const newMatcher: Matcher = {
      active: true,
      identifier: newMatcherIdentifier,
      queries: ["Hello"],
      queryPatterns: ["case", "wholeWord"],
      replacement: "Hi",
      useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
    };

    const testStorage = {
      matchers: [invalidLegacyMatcher, validLegacyMatcher],
      [`matcher__${newMatcherIdentifier}`]: newMatcher,
    };

    expect(matchersFromStorage(testStorage)).toMatchSnapshot();
  });

  it("returns undefined if no matchers exist", () => {
    const notMatcherIdentifier = "1234";
    const testStorage = {
      domainList: ["docs.google.com"],
      matchers: [],
      preferences: {
        activeTab: "rules",
        domainListEffect: "deny",
        extensionEnabled: true,
      },
      [`not-matcher__${notMatcherIdentifier}`]: {
        active: true,
        identifier: notMatcherIdentifier,
        queries: ["Hello"],
        queryPatterns: ["case", "wholeWord"],
        replacement: "Hi",
      },
    };

    expect(matchersFromStorage(testStorage)).toBe(undefined);
  });
});
