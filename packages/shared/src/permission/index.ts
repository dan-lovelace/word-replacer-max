import {
  UserPermission,
  UserGroups,
  UserRolePolicy,
  UserRolePermission,
} from "@worm/types/src/permission";

const rolePolicies: UserRolePolicy = {
  member: ["api:InvokeWhoAmI", "api:InvokeSuggest"],
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

export const canAccess = (groups: UserGroups, permission: UserPermission) => {
  return groups.some((group) => rolePermissions[group].includes(permission));
};
