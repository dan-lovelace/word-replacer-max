import { browser } from "./browser";

const {
  runtime: { getURL },
} = browser;

export function getAssetURL(path?: string) {
  const assetBase = "assets";

  if (!path) return getURL(assetBase);

  return getURL(`${assetBase}/${path}`);
}
