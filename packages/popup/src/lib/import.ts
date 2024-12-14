import { v4 as uuidv4 } from "uuid";

import { getSchemaByVersion, parseDelimitedString } from "@worm/shared";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { Matcher } from "@worm/types/src/rules";
import { StorageSetOptions } from "@worm/types/src/storage";

export function importMatchersCSV(
  fromUserInput: string | ArrayBuffer | null,
  currentMatchers: Matcher[] | undefined,
  options: StorageSetOptions
) {
  const csvData = fromUserInput?.toString();
  const rows = csvData
    ?.split("\n")
    .map((row) => row.trim())
    .filter(Boolean);

  if (!rows || !rows.length) return;

  const queriesToAdd = [];

  for (const row of rows) {
    const parsed = parseDelimitedString(row);

    if (parsed.length > 0) {
      queriesToAdd.push(parsed);
    }
  }

  const newMatchers: Matcher[] = queriesToAdd.map((queries) => ({
    active: true,
    identifier: uuidv4(),
    queries,
    queryPatterns: [],
    replacement: "",
  }));

  return storageSetByKeys(
    {
      matchers: [...(currentMatchers ?? []), ...newMatchers],
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
