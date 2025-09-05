import { merge } from "ts-deepmerge";

import { expect } from "@jest/globals";
import {
  getUpdatedStorage,
} from "@web-extension/popup/src/_preact-app/lib/storage";
import { STORAGE_MATCHER_PREFIX } from "@web-extension/shared/src/browser";
import { Matcher, MatcherInSync } from "@wordreplacermax/types/src/rules";
import {
  RecentSuggestions,
  SessionStorage,
  Storage,
  StorageProvider,
} from "@wordreplacermax/types/src/storage";

jest.mock("@web-extension/shared/src/config/values", () => ({
  VITE_API_ORIGIN: "https://dev-api.wordreplacermax.com",
}));

const TEST_MATCHER_IDENTIFIER_1 = "matcher__1234";
const TEST_MATCHER_IDENTIFIER_2 = "matcher__4567";

const defaultAppMatchers: Matcher[] = [
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

const TEST_MATCHER_1 = defaultAppMatchers[0];
const TEST_MATCHER_2 = defaultAppMatchers[1];

const generateAppMatchers = (overrides: Matcher[] = []) => [
  ...defaultAppMatchers,
  ...overrides,
];

const defaultMatcher1: Record<string, Matcher> = {
  [TEST_MATCHER_IDENTIFIER_1]: {
    active: true,
    identifier: TEST_MATCHER_IDENTIFIER_1,
    queries: ["lorem"],
    queryPatterns: [],
    replacement: "sit",
  },
};

const defaultStoredMatchers: MatcherInSync = {
  ...defaultMatcher1,
  [TEST_MATCHER_IDENTIFIER_2]: {
    active: true,
    identifier: TEST_MATCHER_IDENTIFIER_2,
    queries: ["dolor"],
    queryPatterns: [],
    replacement: "ipsum",
  },
};

const generateStoredMatchers = (overrides: MatcherInSync = {}) =>
  merge(defaultStoredMatchers, overrides);

const defaultRecentSuggestions: RecentSuggestions = {
  [TEST_MATCHER_IDENTIFIER_1]: {
    identifier: "1234",
    apiResponseData: {
      suggestions: [{ text: "lorem" }],
      tone: "neutral",
    },
    selectedTone: "neutral",
  },
};

const generateRecentSuggestions = (
  overrides: Partial<RecentSuggestions> = {}
) => merge(defaultRecentSuggestions, overrides) as RecentSuggestions;

const defaultSessionStorage: SessionStorage = {
  authAccessToken: "XXXX",
  authClockDrift: "10",
  authIdToken: "XXXX",
  authLastAuthUser: "test@wordreplacermax.com",
  authRefreshToken: "XXXX",
};

const generateSessionStorage = (overrides: Partial<SessionStorage> = {}) =>
  merge(defaultSessionStorage, overrides);

const defaultStorage: Storage = {
  local: {},
  session: {},
  sync: {},
};

const generateStorage = (overrides: Partial<Storage> = {}) =>
  merge(defaultStorage, overrides) as Storage;

describe("getUpdatedStorage", () => {
  describe("local area", () => {
    const TEST_AREA_NAME: StorageProvider = "local";

    it("returns an unmodified copy of storage when no changes exist", () => {
      const prevStorage: Storage = {
        local: {
          recentSuggestions: generateRecentSuggestions(),
        },
        session: {},
        sync: {},
      };

      const testResult = getUpdatedStorage(
        prevStorage,
        {
          lorem: {
            newValue: undefined,
            oldValue: undefined,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });

    it("adds a single value when no other keys exist", () => {
      const testResult = getUpdatedStorage(
        generateStorage(),
        {
          recentSuggestions: {
            newValue: defaultRecentSuggestions[TEST_MATCHER_IDENTIFIER_1],
            oldValue: undefined,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });

    it("adds a single value when other keys exist", () => {
      const testResult = getUpdatedStorage(
        generateStorage({
          [TEST_AREA_NAME]: {
            recentSuggestions: generateRecentSuggestions(),
          },
        }),
        {
          lorem: {
            newValue: "ipsum",
            oldValue: undefined,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });

    it("updates an existing value", () => {
      const oldValue = generateRecentSuggestions();

      const newValue = merge(oldValue, {
        [TEST_MATCHER_IDENTIFIER_1]: { selectedTone: "casual" },
      });

      const testResult = getUpdatedStorage(
        generateStorage({
          [TEST_AREA_NAME]: {
            recentSuggestions: oldValue,
          },
        }),
        {
          recentSuggestions: {
            newValue,
            oldValue,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });

    it("removes items when the new value is undefined", () => {
      const oldValue = generateRecentSuggestions();
      const testResult = getUpdatedStorage(
        generateStorage({
          [TEST_AREA_NAME]: {
            recentSuggestions: oldValue,
          },
        }),
        {
          recentSuggestions: {
            newValue: undefined,
            oldValue,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });
  });

  describe("session area", () => {
    const TEST_AREA_NAME: StorageProvider = "session";

    it("returns an unmodified copy of storage when no changes exist", () => {
      const prevStorage: Storage = {
        local: {},
        session: generateSessionStorage(),
        sync: {},
      };

      const testResult = getUpdatedStorage(
        prevStorage,
        {
          lorem: {
            newValue: undefined,
            oldValue: undefined,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });

    it("adds a single value when no other keys exist", () => {
      const prevStorage = generateStorage();

      const testResult = getUpdatedStorage(
        prevStorage,
        {
          authAccessToken: {
            newValue: "YYYY",
            oldValue: undefined,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });

    it("adds a single value when other keys exist", () => {
      const prevStorage: Storage = {
        local: {},
        session: generateSessionStorage(),
        sync: {},
      };

      const testResult = getUpdatedStorage(
        prevStorage,
        {
          lorem: {
            newValue: "ipsum",
            oldValue: undefined,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });

    it("updates an existing value", () => {
      const prevStorage: Storage = {
        local: {},
        session: generateSessionStorage(),
        sync: {},
      };

      const testResult = getUpdatedStorage(
        prevStorage,
        {
          authAccessToken: {
            newValue: "YYYY",
            oldValue: undefined,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });

    it("removes items when the new value is undefined", () => {
      const prevStorage: Storage = {
        local: {},
        session: generateSessionStorage(),
        sync: {},
      };

      const testResult = getUpdatedStorage(
        prevStorage,
        {
          authAccessToken: {
            newValue: undefined,
            oldValue: undefined,
          },
        },
        TEST_AREA_NAME
      );

      expect(testResult).toMatchSnapshot();
    });
  });

  describe("sync area", () => {
    const TEST_AREA_NAME: StorageProvider = "sync";

    describe("non-matcher changes", () => {
      it("returns an unmodified copy of storage when no changes exist", () => {
        const prevStorage: Storage = {
          local: {},
          session: {},
          sync: {
            storageVersion: "1.0.0",
          },
        };

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            lorem: {
              newValue: undefined,
              oldValue: undefined,
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toMatchSnapshot();
      });

      it("adds a single value when no other keys exist", () => {
        const prevStorage = generateStorage();

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            storageVersion: {
              newValue: "1.1.1",
              oldValue: undefined,
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toMatchSnapshot();
      });

      it("adds a single value when other keys exist", () => {
        const prevStorage: Storage = {
          local: {},
          session: {},
          sync: {
            storageVersion: "1.0.0",
          },
        };

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            lorem: {
              newValue: "ipsum",
              oldValue: undefined,
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toMatchSnapshot();
      });

      it("updates an existing value", () => {
        const prevStorage: Storage = {
          local: {},
          session: {},
          sync: {
            storageVersion: "1.0.0",
          },
        };

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            storageVersion: {
              newValue: "1.1.1",
              oldValue: "1.0.0",
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toMatchSnapshot();
      });

      it("removes items when the new value is undefined", () => {
        const prevStorage: Storage = {
          local: {},
          session: {},
          sync: {
            storageVersion: "1.0.0",
          },
        };

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            storageVersion: {
              newValue: undefined,
              oldValue: "1.0.0",
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toMatchSnapshot();
      });
    });

    describe("matcher changes", () => {
      it("returns an unmodified copy of storage when no changes exist", () => {
        const prevStorage: Storage = {
          local: {},
          session: {},
          sync: generateStoredMatchers(),
        };

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            lorem: {
              newValue: undefined,
              oldValue: undefined,
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toEqual(prevStorage);
        expect(testResult).toMatchSnapshot();
      });

      it("adds a single value when no other keys exist", () => {
        const prevStorage = generateStorage();

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            [TEST_MATCHER_IDENTIFIER_1]: {
              newValue: generateStoredMatchers()[TEST_MATCHER_IDENTIFIER_1],
              oldValue: undefined,
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toHaveProperty(`sync.${TEST_MATCHER_IDENTIFIER_1}`);
        expect(testResult).toMatchSnapshot();
      });

      it("adds a single value when other keys exist", () => {
        const prevStorage: Storage = {
          local: {},
          session: {},
          sync: defaultMatcher1,
        };

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            [TEST_MATCHER_IDENTIFIER_2]: {
              newValue: TEST_MATCHER_2,
              oldValue: undefined,
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toHaveProperty(`sync.${TEST_MATCHER_IDENTIFIER_2}`);
        expect(testResult).toMatchSnapshot();
      });

      it("updates an existing value", () => {
        const prevStorage: Storage = {
          local: {},
          session: {},
          sync: defaultMatcher1,
        };

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            [TEST_MATCHER_IDENTIFIER_1]: {
              newValue: { ...TEST_MATCHER_1, active: false },
              oldValue: TEST_MATCHER_1,
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toMatchSnapshot();
      });

      it("removes items when the new value is undefined", () => {
        const prevStorage: Storage = {
          local: {},
          session: {},
          sync: defaultMatcher1,
        };

        const testResult = getUpdatedStorage(
          prevStorage,
          {
            [TEST_MATCHER_IDENTIFIER_1]: {
              newValue: undefined,
              oldValue: TEST_MATCHER_1,
            },
          },
          TEST_AREA_NAME
        );

        expect(testResult).toMatchSnapshot();
      });
    });
  });

  describe("multiple storage areas", () => {
    it("handles changes across all storage areas simultaneously", () => {
      const prevStorage: Storage = {
        local: {
          recentSuggestions: generateRecentSuggestions(),
        },
        session: generateSessionStorage(),
        sync: defaultMatcher1,
      };

      const oldLocalValue = defaultRecentSuggestions[TEST_MATCHER_IDENTIFIER_1];
      const withLocalChanges = getUpdatedStorage(
        prevStorage,
        {
          recentSuggestions: {
            newValue: {
              ...oldLocalValue,
              identifier: "4567",
            },
            oldValue: oldLocalValue,
          },
        },
        "local"
      );

      const finalResult = getUpdatedStorage(
        getUpdatedStorage(
          withLocalChanges,
          {
            authAccessToken: {
              newValue: "ZZZZ",
              oldValue: "XXXX",
            },
          },
          "session"
        ),
        {
          [TEST_MATCHER_IDENTIFIER_2]: {
            newValue: TEST_MATCHER_2,
            oldValue: undefined,
          },
        },
        "sync"
      );

      expect(finalResult).toMatchSnapshot();
    });

    it("handles multiple changes within each storage area", () => {
      const prevStorage: Storage = {
        local: {
          recentSuggestions: generateRecentSuggestions(),
        },
        session: generateSessionStorage(),
        sync: {
          ...defaultMatcher1,
          storageVersion: "1.0.0",
        },
      };

      const withLocalChanges = getUpdatedStorage(
        prevStorage,
        {
          recentSuggestions: {
            newValue: undefined,
            oldValue: generateRecentSuggestions(),
          },
          "new-local-key": {
            newValue: "new-value",
            oldValue: undefined,
          },
        },
        "local"
      );

      const withSessionChanges = getUpdatedStorage(
        withLocalChanges,
        {
          authAccessToken: {
            newValue: "ZZZZ",
            oldValue: "XXXX",
          },
          authIdToken: {
            newValue: undefined,
            oldValue: "XXXX",
          },
          newSessionKey: {
            newValue: "session-value",
            oldValue: undefined,
          },
        },
        "session"
      );

      const finalResult = getUpdatedStorage(
        withSessionChanges,
        {
          [TEST_MATCHER_IDENTIFIER_1]: {
            newValue: undefined,
            oldValue: TEST_MATCHER_1,
          },
          [TEST_MATCHER_IDENTIFIER_2]: {
            newValue: TEST_MATCHER_2,
            oldValue: undefined,
          },
          storageVersion: {
            newValue: "2.0.0",
            oldValue: "1.0.0",
          },
        },
        "sync"
      );

      expect(finalResult).toMatchSnapshot();
    });

    it("handles empty changes in some areas while updating others", () => {
      const prevStorage: Storage = {
        local: {
          recentSuggestions: generateRecentSuggestions(),
        },
        session: generateSessionStorage(),
        sync: defaultMatcher1,
      };

      const withLocalChanges = getUpdatedStorage(
        prevStorage,
        {
          someKey: {
            newValue: undefined,
            oldValue: undefined,
          },
        },
        "local"
      );

      const withSessionChanges = getUpdatedStorage(
        withLocalChanges,
        {
          authAccessToken: {
            newValue: "ZZZZ",
            oldValue: "XXXX",
          },
        },
        "session"
      );

      const finalResult = getUpdatedStorage(
        withSessionChanges,
        {
          anotherKey: {
            newValue: undefined,
            oldValue: undefined,
          },
        },
        "sync"
      );

      expect(finalResult).toMatchSnapshot();
    });

    it("handles complex matcher updates while modifying other storage areas", () => {
      const prevStorage: Storage = {
        local: {
          recentSuggestions: generateRecentSuggestions(),
        },
        session: generateSessionStorage(),
        sync: defaultStoredMatchers,
      };

      const oldLocalValue = defaultRecentSuggestions[TEST_MATCHER_IDENTIFIER_1];
      const withLocalChanges = getUpdatedStorage(
        prevStorage,
        {
          recentSuggestions: {
            newValue: {
              ...oldLocalValue,
              selectedTone: "professional",
            },
            oldValue: oldLocalValue,
          },
        },
        "local"
      );

      const withSessionChanges = getUpdatedStorage(
        withLocalChanges,
        {
          authLastAuthUser: {
            newValue: "test-changed@wordreplacermax.com",
            oldValue: "test@wordreplacermax.com",
          },
        },
        "session"
      );

      const updatedMatcher1 = {
        ...TEST_MATCHER_1,
        active: false,
        queries: ["updated-lorem"],
      };

      const updatedMatcher2 = {
        ...TEST_MATCHER_2,
        replacement: "updated-ipsum",
      };

      const finalResult = getUpdatedStorage(
        withSessionChanges,
        {
          [TEST_MATCHER_IDENTIFIER_1]: {
            newValue: updatedMatcher1,
            oldValue: TEST_MATCHER_1,
          },
          [TEST_MATCHER_IDENTIFIER_2]: {
            newValue: updatedMatcher2,
            oldValue: TEST_MATCHER_2,
          },
        },
        "sync"
      );

      expect(finalResult).toMatchSnapshot();
    });
  });
});
