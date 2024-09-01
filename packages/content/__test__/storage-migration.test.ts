import { expect } from "@jest/globals";

import { storageClear, storageGet, storageSet } from "@worm/shared/src/storage";

import { runStorageMigrations } from "../src/lib";

describe("runStorageMigrations", () => {
  beforeEach(async () => {
    await storageClear();
  });

  it("does not run migrations when on the latest version 1.0.0", async () => {
    const testStorage = {
      domainList: [],
      exportLinks: [],
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
        focusRule: "",
      },
      storageVersion: "1.0.0",
    };

    await storageSet(testStorage);
    await runStorageMigrations("1.0.0");

    const result = await storageGet();
    expect(result).toMatchSnapshot();
  });

  it("does not run migrations when on the latest version 1.1.0", async () => {
    const testStorage = {
      domainList: [],
      exportLinks: [],
      "matcher__b7fce47e-58e8-4409-adf4-08da053e713d": {
        active: true,
        identifier: "b7fce47e-58e8-4409-adf4-08da053e713d",
        queries: ["my jaw dropped", "I was shocked"],
        queryPatterns: [],
        replacement: "I was surprised",
        useGlobalReplacementStyle: true,
      },
      preferences: {
        activeTab: "rules",
        domainListEffect: "deny",
        extensionEnabled: true,
        focusRule: "",
      },
      replacementStyle: {
        active: false,
        backgroundColor: "#ffc107",
        color: "#dc3545",
        options: ["backgroundColor"],
      },
      storageVersion: "1.1.0",
    };

    await storageSet(testStorage);
    await runStorageMigrations("1.1.0");

    const result = await storageGet();
    expect(result).toMatchSnapshot();
  });

  it("migrates from undefined version to 1.0.0", async () => {
    const testStorage = {
      domainList: [],
      exportLinks: [],
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
        focusRule: "",
      },
    };

    await storageSet(testStorage);
    await runStorageMigrations("1.0.0");

    const result = await storageGet();
    expect(result).toMatchSnapshot();
  });

  it("migrates from undefined version to 1.1.0", async () => {
    const testStorage = {
      domainList: [],
      exportLinks: [],
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
        focusRule: "",
      },
    };

    await storageSet(testStorage);
    await runStorageMigrations("1.1.0");

    const result = await storageGet();
    expect(result).toMatchSnapshot();
  });

  it("migrates from 1.0.0 to 1.1.0", async () => {
    const testStorage = {
      domainList: [],
      exportLinks: [],
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
        focusRule: "",
      },
      storageVersion: "1.0.0",
    };

    await storageSet(testStorage);
    await runStorageMigrations("1.1.0");

    const result = await storageGet();
    expect(result).toMatchSnapshot();
  });
});
