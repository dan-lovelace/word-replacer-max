import { assert } from "../assert";

export function getManifestVersion() {
  const { MANIFEST_VERSION } = process.env;

  assert(MANIFEST_VERSION && ["2", "3"].includes(MANIFEST_VERSION));

  return Number(MANIFEST_VERSION);
}
