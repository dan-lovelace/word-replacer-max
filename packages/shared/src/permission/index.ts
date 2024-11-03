import { z } from "zod";

import {
  UserGroups,
  UserPermission,
  UserPoolCustomAttributes,
  UserRolePermission,
  UserRolePolicy,
} from "@worm/types/src/permission";

export const CustomAttributesSchema = z
  .object({
    terms_acceptance: z.object({
      acceptedOn: z.string(),
      acceptedVersion: z.literal("1.0.0"),
    }),
  })
  .strict() satisfies z.ZodType<UserPoolCustomAttributes>;

export type CustomAttributes = z.infer<typeof CustomAttributesSchema>;

const rolePolicies: UserRolePolicy = {
  member: ["api:InvokeAcceptTerms", "api:InvokeWhoAmI", "api:InvokeSuggest"],
  systemAdmin: [],
};

const generatePolicy = <T extends keyof UserRolePolicy>(policies: T[]) => {
  const uniquePermissions = new Set<UserPermission>(
    policies.map((policy) => rolePolicies[policy]).flat()
  );

  return Array.from(uniquePermissions);
};

const rolePermissions: UserRolePermission = {
  Member: generatePolicy(["member"]),
  OrganizationAdmin: generatePolicy(["member"]),
  OrganizationModerator: generatePolicy(["member"]),
  SystemAdmin: generatePolicy(["member", "systemAdmin"]),
};

export const JWT_GROUPS_KEY = "cognito:groups" as const;

export const canAccess = (groups: UserGroups, permission: UserPermission) => {
  return groups.some((group) => rolePermissions[group].includes(permission));
};
