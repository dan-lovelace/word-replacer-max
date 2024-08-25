import { v4 as uuidv4 } from "uuid";

import { getSchemaByVersion } from "@worm/shared";
import { storageSetByKeys } from "@worm/shared/src/browser";
import { Matcher, StorageSetOptions } from "@worm/types";

export default async function importMatchers(
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
