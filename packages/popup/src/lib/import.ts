import papaparse from "papaparse";
import { v4 as uuidv4 } from "uuid";

import { getSchemaByVersion } from "@worm/shared";
import { DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { Matcher } from "@worm/types/src/rules";
import { StorageSetOptions } from "@worm/types/src/storage";

export function importMatchersCSV(
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

  for (const row of parsed.data) {
    if (!row || typeof row !== "object") continue;

    const currentRow = row as Record<string, string>;
    const matcherToAdd: Matcher = {
      active: true,
      identifier: uuidv4(),
      queries: [],
      queryPatterns: [],
      replacement: "",
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

  const matchersToAdd = csvMatchers.filter(
    (matcher) => matcher.queries.length > 0 || matcher.replacement.length > 0
  );

  return storageSetByKeys(
    {
      matchers: [...(currentMatchers ?? []), ...matchersToAdd],
    },
    options
  );
}

export async function importMatchersJSON(
  fromUserInput: any,
  currentMatchers: Matcher[] | undefined,
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

  const enrichedMatchers: Matcher[] = uniqueMatchers.map(
    (matcher: Matcher) => ({
      ...matcher,
      identifier: uuidv4(),
      active: true,
    })
  );

  return storageSetByKeys(
    {
      matchers: [...(currentMatchers ?? []), ...enrichedMatchers],
    },
    options
  );
}
