import { expect } from "@jest/globals";

import {
  localStorageProvider,
  storageRemoveByKeys,
  syncStorageProvider,
} from "@worm/shared/src/storage";
import { Matcher, MatcherGroup } from "@worm/types/src/rules";

import { getMatcherGroups } from "../src/browser";

jest.mock("@worm/shared/src/config/values", () => ({
  VITE_API_ORIGIN: "https://dev-api.wordreplacermax.com",
}));

const TEST_GROUP_IDENTIFIER_1 = "group__1234";
const TEST_GROUP_IDENTIFIER_2 = "group__4567";

const TEST_MATCHER_IDENTIFIER_1 = "matcher__1234";
const TEST_MATCHER_IDENTIFIER_2 = "matcher__4567";

const mockAppMatcherGroups: MatcherGroup[] = [
  {
    active: false,
    color: "blue",
    identifier: "1234",
    matchers: ["1234", "4567"],
    name: "Test Group 1",
  },
  {
    active: false,
    color: "green",
    identifier: "5678",
    matchers: [],
    name: "Test Group 2",
  },
];

const mockAppMatchers: Matcher[] = [
  {
    active: true,
    identifier: "1234",
    queries: ["lorem"],
    queryPatterns: [],
    replacement: "sit",
  },
  {
    active: true,
    identifier: "4567",
    queries: ["dolor"],
    queryPatterns: [],
    replacement: "ipsum",
  },
];

const defaultSyncStorage: Record<string, any> = {
  [TEST_GROUP_IDENTIFIER_1]: mockAppMatcherGroups[0],
  [TEST_GROUP_IDENTIFIER_2]: mockAppMatcherGroups[1],
  [TEST_MATCHER_IDENTIFIER_1]: mockAppMatchers[0],
  [TEST_MATCHER_IDENTIFIER_2]: mockAppMatchers[1],
  ruleSync: {
    active: true,
  },
};

beforeEach(async () => {
  // Clear test browser `sync` storage to start with a clean slate.
  await syncStorageProvider.clear();
});

afterEach(async () => {
  await localStorageProvider.clear();
  await syncStorageProvider.clear();
});

describe("storageRemoveByKeys", () => {
  it("does not orphan rule group matchers when removing individual matchers", async () => {
    await syncStorageProvider.set(defaultSyncStorage);

    const groupsBefore = getMatcherGroups(await syncStorageProvider.get());
    expect(groupsBefore?.[TEST_GROUP_IDENTIFIER_1].matchers?.length).toBe(2);
    expect(groupsBefore?.[TEST_GROUP_IDENTIFIER_1].matchers).toContain("1234");
    expect(groupsBefore?.[TEST_GROUP_IDENTIFIER_1].matchers).toContain("4567");

    await storageRemoveByKeys([TEST_MATCHER_IDENTIFIER_1]);

    const groupsAfter = getMatcherGroups(await syncStorageProvider.get());
    expect(groupsAfter?.[TEST_GROUP_IDENTIFIER_1].matchers?.length).toBe(1);
    expect(groupsAfter?.[TEST_GROUP_IDENTIFIER_1].matchers).not.toContain(
      "1234"
    );
    expect(groupsBefore?.[TEST_GROUP_IDENTIFIER_1].matchers).toContain("4567");
  });

  it("does not orphan rule group matchers when removing multiple matchers", async () => {
    await syncStorageProvider.set(defaultSyncStorage);

    const groupsBefore = getMatcherGroups(await syncStorageProvider.get());
    expect(groupsBefore?.[TEST_GROUP_IDENTIFIER_1].matchers?.length).toBe(2);
    expect(groupsBefore?.[TEST_GROUP_IDENTIFIER_1].matchers).toContain("1234");
    expect(groupsBefore?.[TEST_GROUP_IDENTIFIER_1].matchers).toContain("4567");

    await storageRemoveByKeys([
      TEST_MATCHER_IDENTIFIER_1,
      TEST_MATCHER_IDENTIFIER_2,
    ]);

    const groupsAfter = getMatcherGroups(await syncStorageProvider.get());
    expect(groupsAfter?.[TEST_GROUP_IDENTIFIER_1].matchers?.length).toBe(0);
    expect(groupsAfter?.[TEST_GROUP_IDENTIFIER_1].matchers).not.toContain(
      "1234"
    );
    expect(groupsAfter?.[TEST_GROUP_IDENTIFIER_1].matchers).not.toContain(
      "4567"
    );
  });
});
