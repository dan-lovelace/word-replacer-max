import { createContext } from "preact";
import { useContext, useMemo } from "preact/hooks";

import { decodeJWT } from "aws-amplify/auth";

import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from "@tanstack/react-query";

import { createRuntimeMessage } from "@worm/shared";
import { browser } from "@worm/shared/src/browser";
import {
  getJWTAppUser,
  groupsHavePermission,
  JWT_GROUPS_KEY,
} from "@worm/shared/src/permission";
import { AppUser } from "@worm/types";
import { RuntimeMessage, RuntimeMessageKind } from "@worm/types/src/message";
import { UserGroups, UserPermission } from "@worm/types/src/permission";

import { PreactChildren } from "../lib/types";

import { useConfig } from "./Config";

type AuthStore = {
  currentUser: AppUser;
  fetchCurrentUser: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<false | AppUser, Error>>;
  hasAccess: (permission: UserPermission) => boolean;
};

const Auth = createContext<AuthStore>({} as AuthStore);

export const useAuth = () => useContext(Auth);

export function AuthProvider({ children }: { children: PreactChildren }) {
  const {
    storage: {
      session: { authIdToken, authLastAuthUser },
    },
  } = useConfig();

  /**
   * Construct the current user object.
   */
  const currentUser = useMemo<AppUser>(() => {
    if (authLastAuthUser === undefined) {
      return undefined;
    }

    const jwtAppUser = getJWTAppUser(authIdToken);

    return {
      email: authLastAuthUser,
      emailVerified: Boolean(jwtAppUser?.emailVerified),
      termsAcceptance: jwtAppUser?.termsAcceptance,
    };
  }, [authIdToken, authLastAuthUser]);

  const { refetch: fetchCurrentUser } = useQuery<AppUser, Error, AppUser>({
    queryKey: ["getCurrentUser"],
    retry: false,
    queryFn: async ({ signal }) => {
      const port = browser.runtime.connect({ name: "popup" });

      return new Promise((resolve, reject) => {
        const userRequest = createRuntimeMessage("currentUserRequest");
        port.postMessage({ data: userRequest });

        const responsePollStarted = new Date().getTime();
        const responsePollIntervalMs = 10;
        const responsePollLengthMs = 2000;
        const responsePoll = setInterval(() => {
          if (
            new Date().getTime() - responsePollStarted >
            responsePollLengthMs
          ) {
            doResolve(undefined);
          }
        }, responsePollIntervalMs);

        const doResolve = (response: AppUser) => {
          clearInterval(responsePoll);
          resolve(response);
        };

        const messageHandler = (event: RuntimeMessage<RuntimeMessageKind>) => {
          switch (event.data.kind) {
            case "currentUserResponse": {
              const currentUser = event.data.details?.data as AppUser;

              doResolve(currentUser);
              break;
            }

            default:
              doResolve(undefined);
          }
        };

        port.onMessage.addListener(messageHandler);

        signal.addEventListener("abort", () => {
          clearInterval(responsePoll);
          port.onMessage.removeListener(messageHandler);
          port.disconnect();
          reject(new Error("Query was cancelled"));
        });
      });
    },
  });

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
    <Auth.Provider value={{ currentUser, fetchCurrentUser, hasAccess }}>
      {children}
    </Auth.Provider>
  );
}
