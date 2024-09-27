/* eslint-disable no-console */
import assert from "node:assert";
import { exec } from "node:child_process";
import fs from "node:fs";
import { join } from "node:path";

import { configureNodeEnvironment } from "@worm/plugins";

import { getManifest } from "./manifest";

const OUT_DIR = "dist";

function writeManifest() {
  return new Promise<void>(async (resolve) => {
    const [, , manifestVersion] = process.argv;
    const manifest = await getManifest(Number(manifestVersion));

    fs.writeFileSync(
      join(OUT_DIR, "manifest.json"),
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

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  exec("lerna run build", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${stderr}`);
      process.exit(1);
    }

    writeManifest().then(() => {
      console.log(stdout);
    });
  });
}

main();
