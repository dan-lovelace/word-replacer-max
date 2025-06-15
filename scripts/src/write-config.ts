/* eslint-disable no-console */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import { parse, populate } from "dotenv";

import {
  configDir,
  configureNodeEnvironment,
  fetchAuthConfig,
} from "./lib/config";

async function main() {
  const {
    env: { NODE_ENV },
  } = process;
  configureNodeEnvironment(NODE_ENV);

  const authConfiguration = await fetchAuthConfig(NODE_ENV!);
  const envRecords: Record<string, string> = {};

  for (const key of Object.keys(authConfiguration)) {
    envRecords[`VITE_${key}`] = authConfiguration[key];
  }

  const currentConfigFileName = path.join(configDir, `.env.${NODE_ENV!}`);
  assert(fs.existsSync(currentConfigFileName), "Unable to locate config file");

  const currentConfigFileContents = fs.readFileSync(
    currentConfigFileName,
    "utf-8"
  );
  const currentConfig = parse(currentConfigFileContents);
  populate(currentConfig, envRecords, { override: true });

  const envOutput = Object.keys(currentConfig)
    .map((key) => `${key}=${currentConfig[key]}`)
    .join("\n");

  fs.writeFileSync(currentConfigFileName, envOutput, "utf-8");

  console.log("Updated config", currentConfigFileName);
}

main();
