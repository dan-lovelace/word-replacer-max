/* eslint-disable no-console */
import assert from "node:assert";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

import { Environment, environments } from "@worm/types/src/config";

import { validateVersion, writeManifest } from "./manifest";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const rootDir = join(__dirname, "..", "..", "..");

export const configDir = join(rootDir, "config");
export const distDir = join(rootDir, "dist");
export const versionsDir = join(rootDir, "versions");

async function fetchParameter(name: string) {
  const ssmClient = new SSMClient({ region: "us-east-1" });
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });
  const response = await ssmClient.send(command);

  return response.Parameter?.Value;
}

export function configureNodeEnvironment(nodeEnv: string) {
  config({ path: join(configDir, ".env") });
  config({ path: join(configDir, `.env.${nodeEnv}`) });
}

export async function fetchAuthConfig(mode: string) {
  configureNodeEnvironment(mode);

  const parameterKey = "AuthConfiguration";
  const parameterName = `/word-replacer-max-api-infra-${mode}/${parameterKey}`;
  const parameterValue = await fetchParameter(parameterName);

  if (parameterValue === undefined) {
    throw new Error(`${parameterKey} SSM Parameter value is undefined`);
  }

  return JSON.parse(parameterValue);
}

export function prepareBuild(watch = false) {
  const { NODE_ENV } = process.env;
  const [, , manifestVersion] = process.argv;

  assert(
    NODE_ENV && environments.includes(NODE_ENV as Environment),
    `NODE_ENV must be one of: ${environments.join(", ")}`
  );

  const buildVersion = validateVersion(manifestVersion);

  configureNodeEnvironment(NODE_ENV);

  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  const flags = ["--ignore=@worm/webapp"];

  if (buildVersion === 2) {
    flags.push("--ignore=@worm/offscreen");
  }

  writeManifest().then(() => {
    const args = ["run", watch ? "start" : "build"];

    if (flags.length > 0) {
      args.push(...flags);
    }

    const child = spawn("lerna", args, {
      shell: true,
      stdio: "inherit", // pipe output to terminal
    });

    child.on("error", (error) => {
      console.error("spawn error:", error.message);

      process.exit(1);
    });

    child.on("exit", (code) => {
      if (code !== 0) {
        console.error("Process exited with code", code);

        process.exit(code ?? undefined);
      }
    });
  });
}
