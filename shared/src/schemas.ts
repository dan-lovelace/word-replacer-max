import { z } from "zod";

import { QueryPattern } from "@wordreplacermax/types/src/replace";
import { Matcher } from "@wordreplacermax/types/src/rules";
import {
  SchemaVersion1,
  SchemaVersionMapper,
} from "@wordreplacermax/types/src/storage";

export const validatedMatcher: z.ZodType<Omit<Matcher, "identifier">> = z.lazy(
  () =>
    z.object({
      active: z.boolean(),
      queries: z.array(z.string()),
      queryPatterns: z.array(validatedQueryPattern),
      replacement: z.string(),
      useGlobalReplacementStyle: z
        .boolean()
        /**
         * Made optional during initial rollout of styled replacements to avoid
         * breaking import validation of existing exports. This should be removed
         * at a later time.
         */
        .optional(),
    })
);

export const validatedQueryPattern: z.ZodType<QueryPattern> = z.lazy(() =>
  z.union([
    z.literal("case"),
    z.literal("default"),
    z.literal("regex"),
    z.literal("wholeWord"),
  ])
);

const validatedSchemaVersion1: z.ZodType<SchemaVersion1> = z.lazy(() =>
  z.object({
    version: z.literal(1),
    data: z.object({ matchers: z.array(validatedMatcher) }),
  })
);

const schemaVersionMapper: SchemaVersionMapper = {
  1: validatedSchemaVersion1,
};

export function getSchemaByVersion<V extends keyof SchemaVersionMapper>(
  version: V
): SchemaVersionMapper[V] {
  return schemaVersionMapper[version];
}
