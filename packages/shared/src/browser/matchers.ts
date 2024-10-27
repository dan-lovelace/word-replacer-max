import { Matcher } from "@worm/types";

type StorageMatcher = Matcher & {
  sortIndex: number;
};

export const STORAGE_MATCHER_PREFIX = "matcher__";

/**
 * Translates a flat list of stored matchers to an array. This is a mutational
 * operation as it removes keys from the storage object whose names begin with
 * `matcher__`.
 */
export const convertStoredMatchers = (allStorage: Record<string, any>) => {
  const storedMatchers = Object.keys(allStorage).reduce((acc, val) => {
    const isMatcher = val.startsWith(STORAGE_MATCHER_PREFIX);

    if (!isMatcher) return acc;

    const matcherValue = allStorage[val];
    delete allStorage[val];

    return [...acc, matcherValue];
  }, [] as StorageMatcher[]);

  const sorted: Matcher[] = storedMatchers.sort(
    (a, b) => a.sortIndex - b.sortIndex
  );

  return sorted.length > 0 ? sorted : undefined;
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
