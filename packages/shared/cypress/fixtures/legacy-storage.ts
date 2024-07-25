import { Storage } from "@worm/types";

export const legacyStorage: Storage = {
  domainList: ["docs.google.com", "notion.so", "github.com"],
  matchers: [
    {
      active: true,
      identifier: "82fcc868-607b-4c2a-a3de-eff01ff2ccc5",
      queries: ["I was shocked", "my jaw dropped"],
      queryPatterns: [],
      replacement: "I was surprised",
    },
    {
      active: true,
      identifier: "31ed4da3-23a9-4966-8a74-f47cdedfc3fd",
      queries: ["This.", "literally"],
      queryPatterns: ["case", "wholeWord"],
      replacement: "",
    },
    {
      active: true,
      identifier: "ff2471cf-2c73-48b7-80e2-1629f086a0a0",
      queries: ["1"],
      queryPatterns: ["case"],
      replacement: "5",
    },
    {
      active: true,
      identifier: "31308ec1-0210-406a-a13a-f44515ade0e9",
      queries: ["2"],
      queryPatterns: ["wholeWord"],
      replacement: "6",
    },
    {
      active: true,
      identifier: "4e796f14-3426-427e-84a1-2e64d83f1c39",
      queries: ["3"],
      queryPatterns: ["regex"],
      replacement: "7",
    },
    {
      active: true,
      identifier: "b776089d-4e87-4f96-b3b0-22cdedd10ed8",
      queries: ["4"],
      queryPatterns: [],
      replacement: "8",
    },
  ],
  preferences: {
    activeTab: "rules",
    domainListEffect: "deny",
    extensionEnabled: true,
  },
};
