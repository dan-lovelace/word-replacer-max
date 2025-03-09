import papaparse from "papaparse";
import { v4 as uuidv4 } from "uuid";

import { getSchemaByVersion } from "@worm/shared";
import { matchersToStorage } from "@worm/shared/src/browser";
import { DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import {
  storageSetByKeys,
  syncStorageProvider,
} from "@worm/shared/src/storage";
import { Matcher, StorageMatcher } from "@worm/types/src/rules";
import { StorageSetOptions, SyncStorage } from "@worm/types/src/storage";

export async function importMatchersCSV(
  fromUserInput: string | ArrayBuffer | null,
  currentMatchers: Matcher[] | undefined,
  options: StorageSetOptions
) {
  const parsed = papaparse.parse(fromUserInput?.toString() ?? "", {
    /**
     * Enable header mode so we can iterate over each cell's header name to see
     * if anything looks like a "replacement" column and update the matcher's
     * `replacement`. If not, assume it's a query and push it to the matcher's
     * `queries` array instead.
     */
    header: true,
  });

  const csvMatchers: Matcher[] = [];

  for (const [idx, row] of parsed.data.entries()) {
    if (!row || typeof row !== "object") continue;

    const currentRow = row as Record<string, string>;
    const matcherToAdd: StorageMatcher = {
      active: true,
      identifier: uuidv4(),
      queries: [],
      queryPatterns: [],
      replacement: "",
      sortIndex: idx,
      useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
    };

    /**
     * Iterate over the row object's keys in search of anything that looks like
     * it may be a "replacement" column.
     */
    for (const key of Object.keys(currentRow)) {
      const cellValue = currentRow[key];

      if (!cellValue) continue;

      /**
       * Consider all possibilities of the word "replace".
       *
       * @remarks
       * "replace", "replacement", "replacing", "replace with"
       */
      if (/replac/gi.test(key)) {
        // Add the first instance and silently ignore any subsequent matches.
        if (!matcherToAdd.replacement) {
          matcherToAdd.replacement = cellValue;
        }
      } else {
        matcherToAdd.queries.push(cellValue);
      }
    }

    csvMatchers.push(matcherToAdd);
  }

  const sortIndexStart =
    Math.max(
      ...(currentMatchers?.map(
        (matcher: StorageMatcher) => matcher.sortIndex ?? -1
      ) ?? [])
    ) + 1;

  const matchersToAdd = csvMatchers.filter(
    (matcher) => matcher.queries.length > 0 || matcher.replacement.length > 0
  );

  const enrichedMatchers = matchersToAdd.map((matcher, idx) => ({
    ...matcher,
    identifier: uuidv4(),
    active: true,
    sortIndex: sortIndexStart + idx,
  }));

  const storageMatchers = matchersToStorage(enrichedMatchers);
  const syncStorage = (await syncStorageProvider.get()) as SyncStorage;

  return storageSetByKeys(storageMatchers, {
    ...options,
    provider: syncStorage.ruleSync?.active ? "sync" : "local",
  });
}

export async function importMatchersJSON(
  fromUserInput: any,
  currentMatchers: StorageMatcher[] | undefined,
  options: StorageSetOptions
) {
  const schema = getSchemaByVersion(fromUserInput.version);
  const rulesExport = schema.parse(fromUserInput);
  const {
    data: { matchers: importedMatchers },
  } = rulesExport;

  if (!importedMatchers || !Boolean(importedMatchers.length)) {
    return;
  }

  const uniqueMatchers = importedMatchers.filter(
    ({
      queries: importQueries,
      queryPatterns: importQueryPatterns,
      replacement: importReplacement,
    }: Matcher) =>
      !currentMatchers?.find(
        ({
          queries: currentQueries,
          queryPatterns: currentQueryPatterns,
          replacement: currentReplacement,
        }) =>
          importQueries.length === currentQueries.length &&
          importQueries.every((query) => currentQueries.includes(query)) &&
          importQueryPatterns.length === currentQueryPatterns.length &&
          importQueryPatterns.every((queryPattern) =>
            currentQueryPatterns.includes(queryPattern)
          ) &&
          importReplacement === currentReplacement
      )
  );

  const sortIndexStart =
    Math.max(
      ...(currentMatchers?.map(
        (matcher: StorageMatcher) => matcher.sortIndex ?? -1
      ) ?? [])
    ) + 1;

  const enrichedMatchers: Matcher[] = uniqueMatchers.map(
    (matcher: Matcher, idx: number) => ({
      ...matcher,
      identifier: uuidv4(),
      active: true,
      sortIndex: sortIndexStart + idx,
    })
  );
  const storageMatchers = matchersToStorage(enrichedMatchers);
  const syncStorage = (await syncStorageProvider.get()) as SyncStorage;

  return storageSetByKeys(storageMatchers, {
    ...options,
    provider: syncStorage.ruleSync?.active ? "sync" : "local",
  });
}
