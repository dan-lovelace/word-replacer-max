/* eslint-disable no-console */
import assert from "node:assert";
import { exec } from "node:child_process";
import fs from "node:fs";
import { join } from "node:path";

import { configureNodeEnvironment, distDir } from "./lib/config";
import { getManifest } from "./lib/manifest";

function writeManifest() {
  return new Promise<void>(async (resolve) => {
    const [, , manifestVersion] = process.argv;
    const manifest = await getManifest(Number(manifestVersion));

    fs.writeFileSync(
      join(distDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8"
    );

    resolve();
  });
}

function main() {
  assert(process.env.NODE_ENV, "NODE_ENV is required");

  configureNodeEnvironment(process.env.NODE_ENV);

  assert(
    process.env.AWS_PROFILE && process.env.AWS_PROFILE === "word-replacer-max",
    "AWS_PROFILE must be 'word-replacer-max'"
  );

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  exec("lerna run build --ignore=@worm/webapp", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      process.exit(1);
    }

    writeManifest().then(() => {
      console.log(stdout);
    });
  });
}

main();
