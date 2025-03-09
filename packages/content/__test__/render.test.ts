import { expect } from "@jest/globals";

import {
  generateMatchers,
  TEST_GROUP_ID_1,
  TEST_GROUP_ID_2,
  TEST_MATCHER_ID_1,
} from "@worm/popup/cypress/support/generators/rules";
import { DEFAULT_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { DeepPartial } from "@worm/types";
import { StorageMatcherGroup } from "@worm/types/src/rules";
import { SyncStorage } from "@worm/types/src/storage";

import { renderCache, renderContent } from "../src/lib/render";

type MockStorage =
  | DeepPartial<SyncStorage>
  | Record<string, StorageMatcherGroup>;

const testMatchers = generateMatchers();

const mockReplaceAll = jest.fn();
const mockIsDomainAllowed = jest.fn();
const mockGetMatcherGroups = jest.fn();
const mockGetStorageProvider = {
  get: jest.fn(),
};
const mockMatchersFromStorage = jest.fn();
const mockStorageGetByKeys = jest.fn();
const mockGetStylesheet = jest.fn(() => document.createElement("style"));

jest.mock("@worm/shared", () => ({
  replaceAll: (...args: Parameters<typeof mockReplaceAll>) =>
    mockReplaceAll(...args),
  isDomainAllowed: (...args: Parameters<typeof mockIsDomainAllowed>) =>
    mockIsDomainAllowed(...args),
}));

jest.mock("@worm/shared/src/browser", () => ({
  getMatcherGroups: (...args: Parameters<typeof mockGetMatcherGroups>) =>
    mockGetMatcherGroups(...args),
  matchersFromStorage: (...args: Parameters<typeof mockMatchersFromStorage>) =>
    mockMatchersFromStorage(...args),
}));

jest.mock("@worm/shared/src/storage", () => ({
  getStorageProvider: () => mockGetStorageProvider,
  storageGetByKeys: (...args: Parameters<typeof mockStorageGetByKeys>) =>
    mockStorageGetByKeys(...args),
}));

jest.mock("@worm/shared/src/replace/lib/style", () => ({
  getStylesheet: (...args: Parameters<typeof mockGetStylesheet>) =>
    mockGetStylesheet(...args),
  STYLE_ELEMENT_ID: "test-style-id",
}));

describe("renderContent", () => {
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    dateNowSpy = jest
      .spyOn(Date.prototype, "getTime")
      .mockImplementation(() => 1000);

    mockIsDomainAllowed.mockImplementation(() => true);
    document.head.innerHTML = "";
  });

  afterEach(() => {
    dateNowSpy.mockRestore();

    renderCache.storage = { expires: 0 };
    renderCache.styleElement = { expires: 0 };
  });

  it("should call replaceAll with correct parameters when extension is enabled", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: false },
      ruleSync: { active: true },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledWith(
      mockMatchers,
      DEFAULT_REPLACEMENT_STYLE
    );
  });

  it("should not call replaceAll when extension is disabled", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: false,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: false },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).not.toHaveBeenCalled();
  });

  it("should respect storage cache hits", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: false },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();
    dateNowSpy.mockImplementation(() => 1050);
    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledTimes(2);
  });

  it("should respect storage cache misses", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: false },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();
    dateNowSpy.mockImplementation(() => 1150);
    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(2);
    expect(mockReplaceAll).toHaveBeenCalledTimes(2);
  });

  it("should not call replaceAll when no matchers exist", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: false },
    };

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockMatchersFromStorage.mockReturnValue([]);

    await renderContent();

    expect(mockReplaceAll).not.toHaveBeenCalled();
  });

  it("should call replaceAll when the only rule group is enabled", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: true },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockGetMatcherGroups.mockImplementation(() => ({
      [TEST_GROUP_ID_1]: {
        active: false,
        color: "blue",
        identifier: "1234",
        matchers: [],
        name: "Test Group 1",
      },
    }));
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledWith(
      mockMatchers,
      DEFAULT_REPLACEMENT_STYLE
    );
  });

  it("should not call replaceAll when the only rule group is enabled without rules", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: true },
      [TEST_GROUP_ID_1]: {
        active: true,
        color: "blue",
        identifier: "1234",
        matchers: [],
        name: "Test Group 1",
      },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockGetMatcherGroups.mockImplementation(() => ({
      [TEST_GROUP_ID_1]: {
        active: true,
        color: "blue",
        identifier: "1234",
        matchers: [],
        name: "Test Group 1",
      },
    }));
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).not.toHaveBeenCalled();
  });

  it("should call replaceAll when one of many rule groups is enabled without rules", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: true },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockGetMatcherGroups.mockImplementation(() => ({
      [TEST_GROUP_ID_1]: {
        active: true,
        color: "blue",
        identifier: "1234",
        matchers: [],
        name: "Test Group 1",
      },
      [TEST_GROUP_ID_2]: {
        active: true,
        color: "green",
        identifier: "5678",
        matchers: ["1234"],
        name: "Test Group 2",
      },
    }));
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledWith(
      [testMatchers[TEST_MATCHER_ID_1]],
      DEFAULT_REPLACEMENT_STYLE
    );
  });

  it("should not call replaceAll with rules from disabled groups", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: true },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockGetMatcherGroups.mockImplementation(() => ({
      [TEST_GROUP_ID_1]: {
        active: true,
        color: "blue",
        identifier: "1234",
        matchers: ["1234"],
        name: "Test Group 1",
      },
      [TEST_GROUP_ID_2]: {
        active: false,
        color: "green",
        identifier: "5678",
        matchers: ["5678"],
        name: "Test Group 2",
      },
    }));
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledWith(
      [testMatchers[TEST_MATCHER_ID_1]],
      DEFAULT_REPLACEMENT_STYLE
    );
  });

  it("should call replaceAll with rules from all enabled groups", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: true },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockGetMatcherGroups.mockImplementation(() => ({
      [TEST_GROUP_ID_1]: {
        active: true,
        color: "blue",
        identifier: "1234",
        matchers: ["1234"],
        name: "Test Group 1",
      },
      [TEST_GROUP_ID_2]: {
        active: true,
        color: "green",
        identifier: "5678",
        matchers: ["5678"],
        name: "Test Group 2",
      },
    }));
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledWith(
      mockMatchers,
      DEFAULT_REPLACEMENT_STYLE
    );
  });

  it("should call replaceAll with all rules when all groups are disabled", async () => {
    const mockStorage: MockStorage = {
      preferences: {
        extensionEnabled: true,
      },
      domainList: [],
      replacementStyle: DEFAULT_REPLACEMENT_STYLE,
      ruleGroups: { active: true },
      ...testMatchers,
    };
    const mockMatchers = Object.values(testMatchers);

    mockStorageGetByKeys.mockResolvedValue(mockStorage);
    mockGetMatcherGroups.mockImplementation(() => ({
      [TEST_GROUP_ID_1]: {
        active: false,
        color: "blue",
        identifier: "1234",
        matchers: ["1234"],
        name: "Test Group 1",
      },
      [TEST_GROUP_ID_2]: {
        active: false,
        color: "green",
        identifier: "5678",
        matchers: ["5678"],
        name: "Test Group 2",
      },
    }));
    mockMatchersFromStorage.mockReturnValue(mockMatchers);

    await renderContent();

    expect(mockStorageGetByKeys).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledTimes(1);
    expect(mockReplaceAll).toHaveBeenCalledWith(
      mockMatchers,
      DEFAULT_REPLACEMENT_STYLE
    );
  });
});
