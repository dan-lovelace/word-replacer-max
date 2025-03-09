import {
  Matcher,
  StorageMatcher,
  StorageMatcherGroup,
} from "@worm/types/src/rules";
import { SyncStorage } from "@worm/types/src/storage";

export const STORAGE_MATCHER_GROUP_PREFIX = "group__";

export const STORAGE_MATCHER_PREFIX = "matcher__";

/**
 * Constructs a list of active matchers considering other storage
 * configurations such as rule groups.
 */
export const getActiveMatchers = (
  matchers: Matcher[],
  syncStorage: Record<string, any>
) => {
  const { ruleGroups } = syncStorage as SyncStorage;
  const activeGroups = getActiveMatcherGroups(syncStorage);
  const storedMatchers = sortMatchers(matchers);

  if (!ruleGroups?.active || !activeGroups.length) {
    return storedMatchers;
  }

  return storedMatchers?.filter((matcher) =>
    activeGroups.some((group) => group.matchers?.includes(matcher.identifier))
  );
};

/**
 * Constructs a list of active matcher groups from storage.
 */
export const getActiveMatcherGroups = (allStorage: Record<string, any>) => {
  return Object.values(getMatcherGroups(allStorage) ?? {}).filter(
    (group) => group.active
  );
};

export const getMatcherGroups = (allStorage: Record<string, any>) => {
  const storedGroups: Record<string, StorageMatcherGroup> = Object.keys(
    allStorage
  ).reduce((acc, val) => {
    const isGroup = val.startsWith(STORAGE_MATCHER_GROUP_PREFIX);

    if (!isGroup) return acc;

    const groupValue = allStorage[val];

    return { ...acc, [val]: groupValue };
  }, {} as Record<string, StorageMatcherGroup>);

  return Object.keys(storedGroups).length ? storedGroups : undefined;
};

/**
 * Crawls a storage object looking for items that look like matchers and
 * returns them as an array.
 * @param allStorage - The storage object to crawl
 */
export function matchersFromStorage(
  allStorage: Record<string, any>
): Matcher[] | undefined {
  const storedMatchers: StorageMatcher[] = Object.keys(allStorage).reduce(
    (acc, val) =>
      val.startsWith(STORAGE_MATCHER_PREFIX) ? [...acc, allStorage[val]] : acc,
    [] as StorageMatcher[]
  );

  const sorted = sortMatchers(storedMatchers);

  return sorted && sorted.length > 0 ? sorted : undefined;
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

export function sortMatcherGroups(matcherGroups: StorageMatcherGroup[]) {
  return matcherGroups
    ?.slice()
    .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
}

export function sortMatchers(matchers: StorageMatcher[] | undefined) {
  return matchers
    ?.slice()
    .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
}
