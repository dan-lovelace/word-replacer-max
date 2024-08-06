import { v4 as uuidv4 } from "uuid";

import { getSchemaByVersion, storageSetByKeys } from "@worm/shared";
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

  const enrichedMatchers: Matcher[] = importedMatchers.map(
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
