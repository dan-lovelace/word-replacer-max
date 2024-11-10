import { decodeJWT, JWT } from "aws-amplify/auth";
import { z } from "zod";

import { AppUser } from "@worm/types/src/identity";
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
  member__2024_11_03: [
    "api:post:AuthAcceptTerms",
    "api:post:AuthDeleteAccount",
    "api:post:Suggest",
    "api:get:WhoAmI",
  ],
  systemAdmin__2024_11_03: [
    "api:post:AuthAcceptTerms",
    "api:post:Suggest",
    "api:get:WhoAmI",
  ],
};

const generatePolicy = <T extends keyof UserRolePolicy>(policies: T[]) => {
  const uniquePermissions = new Set<UserPermission>(
    policies.map((policy) => rolePolicies[policy]).flat()
  );

  return Array.from(uniquePermissions);
};

const getJWTCustomAttributes = (
  payload?: JWT["payload"]
): UserPoolCustomAttributes | undefined => {
  if (!payload) return undefined;

  try {
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

const rolePermissions: UserRolePermission = {
  Member: generatePolicy(["member__2024_11_03"]),
  OrganizationAdmin: generatePolicy(["member__2024_11_03"]),
  OrganizationModerator: generatePolicy(["member__2024_11_03"]),
  SystemAdmin: generatePolicy([
    "member__2024_11_03",
    "systemAdmin__2024_11_03",
  ]),
};

export const JWT_EMAIL_KEY = "email";

export const JWT_EMAIL_VERIFIED_KEY = "email_verified";

export const JWT_CUSTOM_ATTRIBUTES_PREFIX = "custom:";

export const JWT_GROUPS_KEY = "cognito:groups" as const;

export const getJWTAppUser = (idToken?: string): AppUser | undefined => {
  if (!idToken) return undefined;

  try {
    const { payload } = decodeJWT(idToken);
    const customAttributes = getJWTCustomAttributes(payload);

    const email = String(payload[JWT_EMAIL_KEY]);
    const emailVerified = Boolean(payload[JWT_EMAIL_VERIFIED_KEY] === true);

    const appUser: AppUser = {
      email,
      emailVerified,
      termsAcceptance: customAttributes?.terms_acceptance,
    };

    return appUser;
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
  return groups.some((group) => rolePermissions[group]?.includes(permission));
};

export const getTermsNeedAcceptance = (termsAcceptance?: TermsAcceptance) => {
  return !Boolean(termsAcceptance?.acceptedOn);
};
