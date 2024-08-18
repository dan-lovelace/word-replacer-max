import { ZodError } from "zod";

import { Matcher } from "@worm/types";

import { logDebug } from "../logging";
import { validatedMatcher } from "../schemas";

import { storageRemoveByKeys, storageSetByKeys } from "./storage";

type StorageMatcher = Matcher & {
  sortIndex: number;
};

export const STORAGE_MATCHER_PREFIX = "matcher__";

export function matchersFromStorage(
  allStorage: Record<string, any>
): Matcher[] | undefined {
  const results: Matcher[] = [];

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
        (acc, val, idx) => ({
          ...acc,
          [`${STORAGE_MATCHER_PREFIX}${val.identifier}`]: {
            ...validatedMatcher.parse(val),
            sortIndex: idx,
          },
        }),
        {} as Record<string, Matcher>
      );

      results.push(...Object.values(convertedMatchers));

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

  // convert stored matchers to an array and sort
  const matchers = Object.keys(allStorage).reduce(
    (acc, val) =>
      val.startsWith(STORAGE_MATCHER_PREFIX) ? [...acc, allStorage[val]] : acc,
    [] as StorageMatcher[]
  );
  const sorted = matchers.sort((a, b) => a.sortIndex - b.sortIndex);

  results.push(...sorted);

  return results.length > 0 ? results : undefined;
}

export function matchersToStorage(
  matchers?: Matcher[]
): Record<string, StorageMatcher> {
  if (matchers === undefined) {
    return {};
  }

  return matchers.reduce(
    (acc, val, idx) => ({
      ...acc,
      [`${STORAGE_MATCHER_PREFIX}${val.identifier}`]: {
        ...val,
        sortIndex: idx,
      },
    }),
    {} as Record<string, StorageMatcher>
  );
}
