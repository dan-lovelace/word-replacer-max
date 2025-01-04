import { STORAGE_MATCHER_GROUP_PREFIX } from "@worm/shared/src/browser";
import { colorGenerator } from "@worm/shared/src/color";
import { StorageMatcherGroup } from "@worm/types/src/rules";

export function generateMatcherGroup(
  overrides?: Partial<StorageMatcherGroup>
): Record<string, StorageMatcherGroup> {
  const identifier = `${STORAGE_MATCHER_GROUP_PREFIX}${crypto.randomUUID()}`;

  const newGroup: Record<string, StorageMatcherGroup> = {
    [identifier]: {
      color: colorGenerator.generate(),
      identifier,
      name: "",
      ...overrides,
    },
  };

  return newGroup;
}
