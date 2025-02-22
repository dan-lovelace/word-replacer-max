/* eslint-disable no-console */
import assert from "node:assert";
import { exec } from "node:child_process";
import fs from "node:fs";

import { Environment, environments } from "@worm/types/src/config";

import { configureNodeEnvironment, distDir } from "./lib/config";
import { writeManifest } from "./lib/manifest";

function main() {
  const { NODE_ENV } = process.env;
  const [, , manifestVersion] = process.argv;

  assert(
    NODE_ENV && environments.includes(NODE_ENV as Environment),
    `NODE_ENV must be one of: ${environments.join(", ")}`
  );

  configureNodeEnvironment(NODE_ENV);

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  exec(
    `MANIFEST_VERSION=${manifestVersion} lerna run build --ignore=@worm/webapp`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        process.exit(1);
      }

      writeManifest().then(() => {
        console.log(stdout);
      });
    }
  );
}

main();
