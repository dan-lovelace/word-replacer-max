import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

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
