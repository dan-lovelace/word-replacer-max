/* eslint-disable no-console */
import assert from "node:assert";
import { exec } from "node:child_process";
import fs from "node:fs";
import { join } from "node:path";

import { Environment, environments } from "@worm/types/src/config";

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
  const { NODE_ENV } = process.env;

  assert(
    NODE_ENV && environments.includes(NODE_ENV as Environment),
    `NODE_ENV must be one of: ${environments.join(", ")}`
  );

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

    writeManifest().then(() => {
      console.log(stdout);
    });
  });
}

main();
