import assert from "node:assert";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { PUBLIC_GITHUB_REPOSITORY_URL } from "@worm/shared/src/support";
import {
  Manifest,
  ManifestBase,
  ManifestV2,
  ManifestV3,
} from "@worm/types/src/manifest";

import { configureNodeEnvironment, distDir } from "./config";

const commonProps: ManifestBase = {
  description: "Seamlessly replace text on any web page.",
  homepage_url: PUBLIC_GITHUB_REPOSITORY_URL,
  icons: {
    64: "assets/img/word-replacer-max-logo_64.png",
    128: "assets/img/word-replacer-max-logo_128.png",
    256: "assets/img/word-replacer-max-logo_256.png",
  },
  manifest_version: 0,
  name: "Word Replacer Max",
  version: "",
};

const manifestV2Base: ManifestV2 = {
  ...commonProps,
  author: "dan@wordreplacermax.com",
  background: {
    page: "offscreen-mv2.html",
  },
  browser_action: {
    default_popup: "popup.html",
  },
  browser_specific_settings: {
    gecko: {
      id: "addon@wordreplacermax.com",
      strict_min_version: "1.0",
    },
  },
  manifest_version: 2,
  permissions: ["contextMenus", "storage"],
  web_accessible_resources: ["assets/*", "replacer.html"],
};

const manifestV3Base: ManifestV3 = {
  ...commonProps,
  action: {
    default_popup: "popup.html",
  },
  author: {
    email: "dan@wordreplacermax.com",
  },
  background: {
    service_worker: "background.js",
  },
  manifest_version: 3,
  permissions: ["contextMenus", "offscreen", "storage"],
  web_accessible_resources: [
    {
      resources: ["assets/*"],
      matches: ["<all_urls>"],
    },
  ],
};

export async function getManifest(version: number): Promise<Manifest> {
  assert(process.env.NODE_ENV, "NODE_ENV is required");
  configureNodeEnvironment(process.env.NODE_ENV);

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

  /**
   * Append content scripts.
   */
  assert(
    process.env.VITE_SSM_WEBAPP_ORIGIN,
    "VITE_SSM_WEBAPP_ORIGIN is required"
  );

  const { hostname: webappHostname, protocol: webappProtocol } = new URL(
    process.env.VITE_SSM_WEBAPP_ORIGIN
  );
  const authMatches = [`${webappProtocol}//${webappHostname}/*`];
  const contentScripts: Manifest["content_scripts"] = [
    {
      matches: authMatches,
      js: ["auth.js"],
    },
    {
      css: ["content.css"],
      exclude_matches: authMatches,
      js: ["content.js"],
      matches: ["<all_urls>"],
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

  /**
   * Validate resolved manifest.
   */
  assert(
    !manifestBase.permissions?.includes("tabs"),
    "Manifest permissions may not contain 'tabs' because the extension will prompt for browsing history access"
  );

  return manifestBase;
}

export function writeManifest() {
  return new Promise<void>(async (resolve) => {
    const [, , manifestVersion] = process.argv;

    const manifest = await getManifest(Number(manifestVersion));

    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }

    writeFileSync(
      join(distDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8"
    );

    resolve();
  });
}
