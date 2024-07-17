import { ZodError } from "zod";

import { Matcher } from "@worm/types";

import { logDebug } from "./logging";
import { validatedMatcher } from "./schemas";
import { storageRemoveByKeys, storageSetByKeys } from "./storage";

export function translateMatchersForStorage(
  matchers?: Matcher[]
): Record<string, Matcher> {
  if (matchers === undefined) {
    return {};
  }

  return matchers.reduce(
    (acc, val) => ({ ...acc, [`matcher__${val.identifier}`]: val }),
    {} as Record<string, Matcher>
  );
}

export function translateStoredMatchers(
  allStorage: Record<string, any>
): Matcher[] | undefined {
  if (Object.prototype.hasOwnProperty.call(allStorage, "matchers")) {
    /**
     * NOTE: In this case, the user has matchers stored in a legacy format. We
     * must convert them to the new structure and remove the old key. This
     * should not block fetching matchers that already align to the new format
     * if it fails for any reason, hence the try/catch.
     */
    try {
      const convertedMatchers: Record<string, Matcher> = (
        allStorage["matchers"] as Matcher[]
      ).reduce(
        (acc, val) => ({
          ...acc,
          [`matcher__${val.identifier}`]: validatedMatcher.parse(val),
        }),
        {} as Record<string, Matcher>
      );

      storageSetByKeys(convertedMatchers);
      storageRemoveByKeys(["matchers"]);
      logDebug("Legacy matchers converted successfully!");
    } catch (e) {
      if (e instanceof ZodError) {
        console.error("Error parsing matcher", e);
      } else {
        console.error("Something went wrong", e);
      }
    }
  }

  const matchers = Object.keys(allStorage).reduce(
    (acc, val) =>
      val.startsWith("matcher__") ? [...acc, allStorage[val]] : acc,
    [] as Matcher[]
  );

  return matchers.length ? matchers : undefined;
}
