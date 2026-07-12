import { ViteEnvConfig } from "@worm/types/src/config";

import { assert } from "../assert";

import values from "./values";

export function getEnvConfig(): Required<ViteEnvConfig> {
  assert(values.VITE_API_ORIGIN, "VITE_API_ORIGIN is required");
  assert(values.VITE_COPYRIGHT_YEAR, "VITE_COPYRIGHT_YEAR is required");
  assert(
    values.VITE_EXTENSION_STORE_URL_CHROME,
    "VITE_EXTENSION_STORE_URL_CHROME is required"
  );
  assert(
    values.VITE_EXTENSION_STORE_URL_EDGE,
    "VITE_EXTENSION_STORE_URL_EDGE is required"
  );
  assert(
    values.VITE_EXTENSION_STORE_URL_FIREFOX,
    "VITE_EXTENSION_STORE_URL_FIREFOX is required"
  );
  assert(values.VITE_RECAPTCHA_SITE_KEY, "VITE_RECAPTCHA_SITE_KEY is required");
  assert(values.VITE_SSM_WEBAPP_ORIGIN, "VITE_SSM_WEBAPP_ORIGIN is required");

  return values;
}
