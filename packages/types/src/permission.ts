import { ApiAuthTokens } from "./api";

type PolicyName =
  | "systemAdmin__2024_11_03"
  | "testMember__2024_11_10"
  | "member__2024_11_03";

export type TermsAcceptance = {
  acceptedOn: string;
};

export type TokenClaims = {
  "cognito:groups": UserGroup[];
  username: string;
};

export type UserGroup =
  | (
      | "SystemAdmin"
      | "OrganizationModerator"
      | "OrganizationAdmin"
      | "TestMember"
      | "Member"
    )
  /**
   * Take into account external provider groups that look like this:
   * `us-east-1_X9iPWNWf9_GitHub`.
   */
  | string;

export type UserGroups = UserGroup[];

export type UserPermission =
  | "api:get:WhoAmI"
  | "api:post:AuthAcceptTerms"
  | "api:post:AuthDeleteAccount"
  | "api:post:AuthTestTokens"
  | "api:post:Suggest"
  | "api:unlimitedUsage";

export type UserPoolCustomAttributes = {
  terms_acceptance: TermsAcceptance;
};

export type UserRolePermission = Record<UserGroup, UserPermission[]>;

export type UserRolePolicy = Record<PolicyName, UserPermission[]>;

export type UserTokens = Omit<ApiAuthTokens, "refreshToken">;
