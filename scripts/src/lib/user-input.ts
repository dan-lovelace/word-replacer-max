import { environments } from "@worm/types/src/config";

const validManifestVersions = [2, 3] as const;

/**
 * Validates the manifest version given to this process as the third argument and returns it if it's valid.
 * @throws Error if the manifest version given to this process isn't valid.
 * @returns The manifest version given to this process if it's valid.
 */
export function getValidatedManifestVersion(): number {
  //
  const manifestVersion = Number(process.argv[2]);
  if (manifestVersion === undefined) {
    throw new Error(`You have to input a manifest version (${validManifestVersions.join(", ")}) after "yarn build".`);
  } else if (!(validManifestVersions as readonly number[]).includes(manifestVersion)) {
    throw new Error(`The given manifest version "${manifestVersion}" (after "yarn build") is invalid; it must be one of ${validManifestVersions.join(", ")}.`)
  }

  return manifestVersion;
}

/**
 * Validates the given environment string.
 * @param nodeEnv The string that identifies the environment that should be used.
 * @throws Error if the given environment string isn't valid.
 */
export function validateNodeEnvironment(nodeEnv: string | undefined) {
  // Validate given node environment identifier
if (!nodeEnv) {
    throw new Error(`The environment variable NODE_ENV must be set to one of ${environments.join(", ")}.`);
  } else if (!(environments as readonly string[]).includes(nodeEnv)) {
    throw new Error(`The NODE_ENV value "${nodeEnv}" is invalid; it must be one of ${environments.join(", ")}.`);
  }
}

/**
 * Validates that the given environment string references the production environment. 
 * @param nodeEnv The string that identifies the environment that should be used.
 * @throws Error if the given environment string doesn't reference the production environment.
 */
export function validateProductionEnvironment(nodeEnv: string | undefined) {
  if (!nodeEnv) {
    throw new Error(`The environment variable NODE_ENV must be set to "production" in order to package, however it is not set.`);
  } else if (nodeEnv != "production") {
    throw new Error(`The environment variable NODE_ENV must be set to "production" in order to package, however it is "${nodeEnv}".`);
  }
}
