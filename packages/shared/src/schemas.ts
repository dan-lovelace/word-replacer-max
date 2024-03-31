import { z } from "zod";

import type {
  Matcher,
  QueryPattern,
  SchemaVersion1,
  SchemaVersionMapper,
} from "@worm/types";

export const validatedMatcher: z.ZodType<Matcher> = z.lazy(() =>
  z.object({
    active: z.boolean(),
    identifier: z.string(),
    queries: z.array(z.string()),
    queryPatterns: z.array(validatedQueryPattern),
    replacement: z.string(),
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
