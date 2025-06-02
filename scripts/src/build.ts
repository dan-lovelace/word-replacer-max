/* eslint-disable no-console */
import assert from "node:assert";
import { exec } from "node:child_process";
import fs from "node:fs";
import { join } from "node:path";

import { configureNodeEnvironment, distDir } from "./lib/config";
import { getManifest } from "./lib/manifest";
import { getValidatedManifestVersion } from "./lib/user-input";

function writeManifest(manifestVersion: number) {
  return new Promise<void>(async (resolve) => {
    const manifest = await getManifest(manifestVersion);

    fs.writeFileSync(
      join(distDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8"
    );

    resolve();
  });
}

function main() {
  const manifestVersion = getValidatedManifestVersion(); 
  const { NODE_ENV } = process.env;
  configureNodeEnvironment(NODE_ENV);

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  exec("lerna run build --ignore=@worm/webapp", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      process.exit(1);
    }

    writeManifest(manifestVersion).then(() => {
      console.log(stdout);
    });
  });
}

main();
