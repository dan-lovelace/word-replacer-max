type PolicyName = "member__2024_11_03" | "systemAdmin__2024_11_03";

export type TermsAcceptance = {
  acceptedOn: string;
};

export type TokenClaims = {
  "cognito:groups": UserGroup[];
  username: string;
};

export type UserGroup =
  | ("Member" | "OrganizationAdmin" | "OrganizationModerator" | "SystemAdmin")
  | string;

export type UserGroups = UserGroup[];

export type UserPermission =
  | "api:get:WhoAmI"
  | "api:post:AuthAcceptTerms"
  | "api:post:AuthDeleteAccount"
  | "api:post:Suggest";

export type UserPoolCustomAttributes = {
  terms_acceptance: TermsAcceptance;
};

export type UserRolePermission = Record<UserGroup, UserPermission[]>;

export type UserRolePolicy = Record<PolicyName, UserPermission[]>;
