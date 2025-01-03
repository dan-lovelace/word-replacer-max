import { Matcher, StorageMatcher } from "@worm/types/src/rules";

export const STORAGE_MATCHER_PREFIX = "matcher__";

/**
 * Translates a flat list of stored matchers to an array. This is a mutational
 * operation as it removes keys from the storage object whose names begin with
 * `matcher__`.
 */
export const convertStoredMatchers = (allStorage: Record<string, any>) => {
  const storedMatchers: StorageMatcher[] = Object.keys(allStorage).reduce(
    (acc, val) => {
      const isMatcher = val.startsWith(STORAGE_MATCHER_PREFIX);

      if (!isMatcher) return acc;

      const matcherValue = allStorage[val];
      delete allStorage[val];

      return [...acc, matcherValue];
    },
    [] as StorageMatcher[]
  );

  const sorted = sortMatchers(storedMatchers);

  return sorted && sorted.length > 0 ? sorted : undefined;
};

export function matchersFromStorage(allStorage: Record<string, any>) {
  return convertStoredMatchers(allStorage);
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

export function sortMatchers(matchers: StorageMatcher[] | undefined) {
  return matchers?.sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
}
