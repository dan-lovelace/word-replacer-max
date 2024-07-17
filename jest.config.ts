const path = require("path");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  // mock `webextension-polyfill` when testing
  moduleNameMapper: {
    "^webextension-polyfill$": path.join(
      process.cwd(),
      "packages",
      "shared",
      "__mocks__",
      "browser.ts"
    ),
  },
};
