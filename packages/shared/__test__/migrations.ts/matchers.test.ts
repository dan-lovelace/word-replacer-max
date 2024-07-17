import {
  translateMatchersForStorage,
  translateStoredMatchers,
} from "@worm/shared/src/migrations";
import { Matcher } from "@worm/types";

describe("translateMatchersForStorage", () => {
  const testMatchers: Matcher[] = [
    {
      active: true,
      identifier: "b7fce47e-58e8-4409-adf4-08da053e713d",
      queries: ["my jaw dropped", "I was shocked"],
      queryPatterns: [],
      replacement: "I was surprised",
    },
    {
      active: true,
      identifier: "34eb8c78-402e-4006-b5a9-b1b15af7a037",
      queries: ["This."],
      queryPatterns: ["case", "wholeWord"],
      replacement: "",
    },
  ];

  it("converts an array of matchers to a shape acceptable for storage", () => {
    expect(translateMatchersForStorage(testMatchers)).toMatchSnapshot();
  });
});

describe("translateStoredMatchers", () => {
  it("converts a raw storage object's matchers to a shape expected by the rest of the system", () => {
    const testStorage = {
      domainList: ["docs.google.com"],
      "matcher__34eb8c78-402e-4006-b5a9-b1b15af7a037": {
        active: true,
        identifier: "34eb8c78-402e-4006-b5a9-b1b15af7a037",
        queries: [],
        queryPatterns: ["case", "wholeWord"],
        replacement: "",
      },
      "matcher__b7fce47e-58e8-4409-adf4-08da053e713d": {
        active: true,
        identifier: "b7fce47e-58e8-4409-adf4-08da053e713d",
        queries: ["my jaw dropped", "I was shocked"],
        queryPatterns: [],
        replacement: "I was surprised",
      },
      preferences: {
        activeTab: "rules",
        domainListEffect: "deny",
        extensionEnabled: true,
      },
    };

    expect(translateStoredMatchers(testStorage)).toMatchSnapshot();
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
      queries: ["This."],
      queryPatterns: ["case", "wholeWord"],
      replacement: "",
    };

    // provide a valid matcher with the new structure to make sure it's preserved
    const newMatcherIdentifier = "1234";
    const newMatcher: Matcher = {
      active: true,
      identifier: newMatcherIdentifier,
      queries: [],
      queryPatterns: ["case", "wholeWord"],
      replacement: "",
    };

    // construct a storage object to test
    const testStorage = {
      matchers: [invalidLegacyMatcher, validLegacyMatcher],
      [`matcher__${newMatcherIdentifier}`]: newMatcher,
    };

    expect(translateStoredMatchers(testStorage)).toMatchSnapshot();
  });
});
