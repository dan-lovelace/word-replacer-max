import { v4 as uuidv4 } from "uuid";

import { STORAGE_MATCHER_GROUP_PREFIX } from "@web-extension/shared/src/browser";
import { colorGenerator } from "@web-extension/shared/src/color";
import { StorageMatcherGroup } from "@wordreplacermax/types/src/rules";

export function generateMatcherGroup(
  overrides?: Partial<StorageMatcherGroup>
): Record<string, StorageMatcherGroup> {
  const identifier = uuidv4();

  const newGroup: Record<string, StorageMatcherGroup> = {
    [`${STORAGE_MATCHER_GROUP_PREFIX}${identifier}`]: {
      color: colorGenerator.generate(),
      identifier,
      name: "",
      ...overrides,
    },
  };

  return newGroup;
}
