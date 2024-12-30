import { expect } from "@jest/globals";

import { getStorageProvider, storageSetByKeys } from "@worm/shared/src/storage";
import { Matcher, MatcherInSync } from "@worm/types/src/rules";
import { LocalStorage, RecentSuggestions } from "@worm/types/src/storage";

import { matchersFromStorage } from "../src/browser";

jest.mock("@worm/shared/src/config/values", () => ({
  VITE_API_ORIGIN: "https://dev-api.wordreplacermax.com",
}));

const TEST_MATCHER_IDENTIFIER_1 = "matcher__1234";
const TEST_MATCHER_IDENTIFIER_2 = "matcher__4567";

const mockRecentSuggestions: RecentSuggestions = {
  [TEST_MATCHER_IDENTIFIER_1]: {
    identifier: "1234",
    apiResponseData: {
      suggestions: [{ text: "lorem" }],
      tone: "neutral",
    },
    selectedTone: "neutral",
  },
  [TEST_MATCHER_IDENTIFIER_2]: {
    identifier: "4567",
    apiResponseData: {
      suggestions: [{ text: "ipsum" }],
      tone: "neutral",
    },
    selectedTone: "neutral",
  },
};

const mockAppMatchers: Matcher[] = [
  {
    active: true,
    identifier: TEST_MATCHER_IDENTIFIER_1,
    queries: ["lorem"],
    queryPatterns: [],
    replacement: "sit",
  },
  {
    active: true,
    identifier: TEST_MATCHER_IDENTIFIER_2,
    queries: ["dolor"],
    queryPatterns: [],
    replacement: "ipsum",
  },
];

const defaultLocalStorage: LocalStorage = {
  recentSuggestions: mockRecentSuggestions,
};

const defaultSyncStorage: MatcherInSync = {
  [TEST_MATCHER_IDENTIFIER_1]: mockAppMatchers[0],
  [TEST_MATCHER_IDENTIFIER_2]: mockAppMatchers[1],
};

const localStorage = getStorageProvider("local");
const syncStorage = getStorageProvider("sync");

describe("storageSetByKeys", () => {
  beforeEach(async () => {
    // Clear test browser `sync` storage to start with a clean slate.
    await syncStorage.clear();
  });

  afterEach(async () => {
    await localStorage.clear();
    await syncStorage.clear();
  });

  it("removes orphaned recent suggestions when updating matchers", async () => {
    const keyToOrphan = "matcher__7890";

    const testLocalValues: LocalStorage = {
      ...defaultLocalStorage,
      recentSuggestions: {
        ...defaultLocalStorage.recentSuggestions,
        [keyToOrphan]: {
          identifier: "7890",
          apiResponseData: {
            suggestions: [{ text: "ipsum" }],
            tone: "neutral",
          },
          selectedTone: "neutral",
        },
      },
    };
    await localStorage.set(testLocalValues);
    expect(
      Object.keys((await localStorage.get()).recentSuggestions ?? {})
    ).toHaveLength(3);

    await storageSetByKeys({
      matchers: mockAppMatchers,
    });
    expect(matchersFromStorage(await syncStorage.get())).toHaveLength(2);

    const { recentSuggestions } = await localStorage.get();
    expect(recentSuggestions).toHaveProperty(TEST_MATCHER_IDENTIFIER_1);
    expect(recentSuggestions).toHaveProperty(TEST_MATCHER_IDENTIFIER_2);
    expect(recentSuggestions).not.toHaveProperty(keyToOrphan);
  });

  it("does not modify recent suggestions when matchers are not being updated", async () => {
    await syncStorage.set(defaultSyncStorage);

    const keyToRetain = "matcher__7890";

    const testLocalValues: LocalStorage = {
      ...defaultLocalStorage,
      recentSuggestions: {
        ...defaultLocalStorage.recentSuggestions,
        [keyToRetain]: {
          identifier: "7890",
          apiResponseData: {
            suggestions: [{ text: "ipsum" }],
            tone: "neutral",
          },
          selectedTone: "neutral",
        },
      },
    };
    await localStorage.set(testLocalValues);
    expect(
      Object.keys((await localStorage.get()).recentSuggestions ?? {})
    ).toHaveLength(3);

    await storageSetByKeys({
      storageVersion: "1.0.0",
    });
    expect(matchersFromStorage(await syncStorage.get())).toHaveLength(2);

    const { recentSuggestions } = await localStorage.get();
    expect(recentSuggestions).toHaveProperty(TEST_MATCHER_IDENTIFIER_1);
    expect(recentSuggestions).toHaveProperty(TEST_MATCHER_IDENTIFIER_2);
    expect(recentSuggestions).toHaveProperty(keyToRetain);
  });
});
