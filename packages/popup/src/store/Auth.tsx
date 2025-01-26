import { createContext } from "preact";
import { useContext, useEffect, useMemo } from "preact/hooks";

import {
  connectionManager,
  ConnectMessageSender,
} from "@worm/shared/src/browser";
import {
  getJWTAppUser,
  getTokenGroups,
  groupsHavePermission,
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

    const groups = getTokenGroups(authIdToken);

    return groups
      ? groupsHavePermission(groups as UserGroups, permission)
      : false;
  };

  return (
    <Auth.Provider value={{ currentUser, hasAccess }}>{children}</Auth.Provider>
  );
}
