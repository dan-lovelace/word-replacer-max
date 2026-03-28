import { ManifestBase } from "@worm/types/src/manifest";

export type BrowserCommand = keyof typeof BROWSER_COMMANDS;

export const BROWSER_COMMANDS = {
  "input-replacement": {
    description: "Execute replacements on all input elements",
    suggested_key: {
      default: "Ctrl+Shift+E",
      mac: "Command+Shift+E",
    },
  },
} satisfies ManifestBase["commands"];
