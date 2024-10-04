import assert from "node:assert";
import { readFileSync } from "node:fs";

import {
  Manifest,
  ManifestBase,
  ManifestV2,
  ManifestV3,
} from "@worm/types/src/manifest";

import { fetchAuthConfig } from "./config";

const commonProps: ManifestBase = {
  description: "Seamlessly replace text on any web page.",
  homepage_url: "https://github.com/dan-lovelace/word-replacer-max",
  icons: {
    48: "assets/img/word-replacer-max-logo_64.png",
    128: "assets/img/word-replacer-max-logo_128.png",
    256: "assets/img/word-replacer-max-logo_256.png",
  },
  manifest_version: 0,
  name: "Word Replacer Max",
  permissions: ["contextMenus", "storage", "tabs"],
  version: "",
};

const manifestV2Base: ManifestV2 = {
  ...commonProps,
  author: "dan@logicnow.io",
  background: {
    scripts: ["background.js"],
  },
  browser_action: {
    default_popup: "popup.html",
  },
  browser_specific_settings: {
    gecko: {
      id: "addon@logicnow.io",
      strict_min_version: "1.0",
    },
  },
  manifest_version: 2,
  web_accessible_resources: ["assets/*"],
};

const manifestV3Base: ManifestV3 = {
  ...commonProps,
  action: {
    default_popup: "popup.html",
  },
  author: {
    email: "dan@logicnow.io",
  },
  background: {
    service_worker: "background.js",
  },
  manifest_version: 3,
  web_accessible_resources: [
    {
      resources: ["assets/*"],
      matches: ["<all_urls>"],
    },
  ],
};

export async function getManifest(version: number): Promise<Manifest> {
  assert(process.env.NODE_ENV, "NODE_ENV is required");

  const validVersions = [2, 3];
  assert(validVersions.includes(version), "Invalid manifest version");

  let manifestBase: Manifest;
  switch (version) {
    case 2:
      manifestBase = manifestV2Base;
      break;

    default:
      manifestBase = manifestV3Base;
  }

  /**
   * Update `version` to the one from `package.json`.
   */
  const { version: packageVersion } = JSON.parse(
    readFileSync("package.json", "utf-8")
  );
  assert(packageVersion, "Package version is required");

  manifestBase.version = packageVersion;

  const authConfig = await fetchAuthConfig(process.env.NODE_ENV);
  const { SSM_WEBAPP_ORIGIN } = authConfig;

  /**
   * Append content scripts.
   */
  assert(SSM_WEBAPP_ORIGIN, "SSM_WEBAPP_ORIGIN is required");

  const { hostname: webappHostname, protocol: webappProtocol } = new URL(
    SSM_WEBAPP_ORIGIN
  );
  const authMatches = [`${webappProtocol}//${webappHostname}/*`];
  const contentScripts: Manifest["content_scripts"] = [
    {
      matches: authMatches,
      js: ["auth.js"],
    },
    {
      matches: ["<all_urls>"],
      exclude_matches: authMatches,
      js: ["content.js"],
      run_at: "document_start",
    },
  ];
  manifestBase.content_scripts = contentScripts;

  /**
   * Append dynamic permissions.
   */
  const {
    env: { VITE_API_ORIGIN },
  } = process;
  assert(VITE_API_ORIGIN, "VITE_API_ORIGIN is required");

  const apiOrigin = `${VITE_API_ORIGIN}/*`;

  switch (version) {
    case 2:
      manifestBase.permissions = [
        ...(manifestBase.permissions || []),
        apiOrigin,
      ];
      break;

    default:
      manifestBase.host_permissions = [
        ...(manifestBase.host_permissions || []),
        apiOrigin,
      ];
  }

  return manifestBase;
}
