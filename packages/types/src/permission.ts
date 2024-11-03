type PolicyName = "member" | "systemAdmin";

type TermsVersion = "1.0.0";

export type TermsAcceptance = {
  acceptedOn: string;
  acceptedVersion: TermsVersion;
};

export type TokenClaims = {
  "cognito:groups": UserGroup[];
  username: string;
};

export type UserGroup =
  | "Member"
  | "OrganizationAdmin"
  | "OrganizationModerator"
  | "SystemAdmin";

export type UserGroups = UserGroup[];

export type UserPermission =
  | "api:InvokeAcceptTerms"
  | "api:InvokeWhoAmI"
  | "api:InvokeSuggest";

export type UserPoolCustomAttributes = {
  terms_acceptance: TermsAcceptance;
};

export type UserRolePermission = Record<UserGroup, UserPermission[]>;

export type UserRolePolicy = Record<PolicyName, UserPermission[]>;
