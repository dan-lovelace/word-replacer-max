import { expect } from "@jest/globals";

import {
  CURRENT_STORAGE_VERSION,
  storageClear,
  storageGet,
  storageSet,
} from "@worm/shared/src/storage";

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

  it("works with extension version v0.6.2 storage", async () => {
    const testStorage = {
      domainList: ["docs.google.com", "github.com"],
      exportLinks: [
        {
          identifier: 1723129855475,
          url: "https://cdn.wordreplacermax.com/abcd-1234.json",
        },
        {
          identifier: 1723348515681,
          url: "https://cdn.wordreplacermax.com/efgh-5678.json",
        },
      ],
      "matcher__611e296a-3347-4ccf-9608-22d08f21f66e": {
        active: true,
        identifier: "611e296a-3347-4ccf-9608-22d08f21f66e",
        queries: ["my jaw dropped", "I was shocked"],
        queryPatterns: [],
        replacement: "I was surprised",
        sortIndex: 1,
      },
      "matcher__a7722e1b-458b-44a0-af49-c18753b9b628": {
        active: true,
        identifier: "a7722e1b-458b-44a0-af49-c18753b9b628",
        queries: ["novel"],
        queryPatterns: ["case"],
        replacement: "unique",
        sortIndex: 0,
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
    await runStorageMigrations(CURRENT_STORAGE_VERSION);

    const result = await storageGet();
    expect(result).toMatchSnapshot();
  });
});
