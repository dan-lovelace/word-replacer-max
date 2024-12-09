import { createContext } from "preact";
import { useContext, useEffect, useMemo } from "preact/hooks";

import { decodeJWT } from "aws-amplify/auth";

import {
  connectionManager,
  ConnectMessageSender,
} from "@worm/shared/src/browser";
import {
  getJWTAppUser,
  groupsHavePermission,
  JWT_GROUPS_KEY,
} from "@worm/shared/src/permission";
import { AppUser } from "@worm/types/src/identity";
import { UserGroups, UserPermission } from "@worm/types/src/permission";

import { PreactChildren } from "../lib/types";

import { useConfig } from "./Config";

type AuthStore = {
  currentUser: AppUser;
  hasAccess: (permission: UserPermission) => boolean;
};

export const AUTH_MESSAGE_SENDER: ConnectMessageSender = "auth-store";

const Auth = createContext<AuthStore>({} as AuthStore);

export const useAuth = () => useContext(Auth);

export function AuthProvider({ children }: { children: PreactChildren }) {
  const {
    storage: {
      local: { authIdToken, authLastAuthUser },
    },
  } = useConfig();

  useEffect(() => {
    /**
     * Send an initial request to refresh current user in storage.
     */
    connectionManager.sendMessage(AUTH_MESSAGE_SENDER, "currentUserRequest");
  }, []);

  /**
   * Construct the current user object using storage values.
   */
  const currentUser = useMemo<AppUser>(() => {
    if (authLastAuthUser === undefined) {
      return undefined;
    }

    const jwtAppUser = getJWTAppUser(authIdToken);
    const appUser: AppUser = {
      email: authLastAuthUser,
      emailVerified: Boolean(jwtAppUser?.emailVerified),
      termsAcceptance: jwtAppUser?.termsAcceptance,
    };

    return appUser;
  }, [authIdToken, authLastAuthUser]);

  const hasAccess = (permission: UserPermission) => {
    if (!authIdToken) {
      return false;
    }

    const groups = decodeJWT(authIdToken).payload[JWT_GROUPS_KEY];

    if (!groups || !Array.isArray(groups)) {
      return false;
    }

    return groupsHavePermission(groups as UserGroups, permission);
  };

  return (
    <Auth.Provider value={{ currentUser, hasAccess }}>{children}</Auth.Provider>
  );
}
