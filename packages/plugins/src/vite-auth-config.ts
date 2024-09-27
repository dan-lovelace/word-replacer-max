import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { Plugin } from "vite";

import { configureNodeEnvironment } from ".";

const SSM_PARAMETER_PREFIX = "/word-replacer-max-api-infra";

const fetchParameter = async (name: string) => {
  const ssmClient = new SSMClient({ region: "us-east-1" });
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });
  const response = await ssmClient.send(command);

  return response.Parameter?.Value;
};

export async function fetchAuthConfig(mode: string) {
  configureNodeEnvironment(mode);

  const parameterKey = "AuthConfiguration";
  const parameterName = `${SSM_PARAMETER_PREFIX}-${mode}/${parameterKey}`;
  const parameterValue = await fetchParameter(parameterName);

  if (parameterValue === undefined) {
    throw new Error(`${parameterKey} SSM Parameter value is undefined`);
  }

  return JSON.parse(parameterValue);
}

export function authConfig(): Plugin {
  return {
    name: "vite-auth-config",
    async config(_, envConfig) {
      const authConfiguration = await fetchAuthConfig(envConfig.mode);
      const envVars: Record<string, string> = {};

      for (const key of Object.keys(authConfiguration)) {
        envVars[`VITE_${key}`] = authConfiguration[key];
      }

      return {
        define: {
          ...Object.entries(envVars).reduce<Record<string, string>>(
            (acc, [key, value]) => {
              acc[`import.meta.env.${key}`] = JSON.stringify(value);

              return acc;
            },
            {}
          ),
        },
      };
    },
  };
}
