import { decodeJWT } from "aws-amplify/auth";
import { z } from "zod";

import {
  TermsAcceptance,
  UserGroups,
  UserPermission,
  UserPoolCustomAttributes,
  UserRolePermission,
  UserRolePolicy,
} from "@worm/types/src/permission";

import { logDebug } from "../logging";

export const CustomAttributesSchema = z
  .object({
    terms_acceptance: z.object({
      acceptedOn: z.string(),
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

export const JWT_CUSTOM_ATTRIBUTES_PREFIX = "custom:";

export const JWT_GROUPS_KEY = "cognito:groups" as const;

export const getJWTCustomAttributes = (
  jwt?: string
): UserPoolCustomAttributes | undefined => {
  if (!jwt) return undefined;

  try {
    const { payload } = decodeJWT(String(jwt));

    const customAttributes = Object.keys(payload).reduce(
      (acc, val) =>
        val.startsWith(JWT_CUSTOM_ATTRIBUTES_PREFIX)
          ? {
              ...acc,
              [val.replace(JWT_CUSTOM_ATTRIBUTES_PREFIX, "")]: JSON.parse(
                String(payload[val])
              ),
            }
          : acc,
      {}
    );

    const customAttributesParseResult =
      CustomAttributesSchema.safeParse(customAttributes);

    if (!customAttributesParseResult.success) return undefined;

    return customAttributesParseResult.data;
  } catch (error) {
    logDebug(
      "Error getting custom attributes:",
      error instanceof Error ? error.message : error
    );

    return undefined;
  }
};

export const groupsHavePermission = (
  groups: UserGroups,
  permission: UserPermission
) => {
  return groups.some((group) => rolePermissions[group].includes(permission));
};

export const getTermsNeedAcceptance = (termsAcceptance?: TermsAcceptance) => {
  return !Boolean(termsAcceptance?.acceptedOn);
};
