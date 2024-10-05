import { createContext } from "preact";
import { useContext, useMemo } from "preact/hooks";

import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from "@tanstack/react-query";

import { createRuntimeMessage } from "@worm/shared";
import { browser } from "@worm/shared/src/browser";
import { AppUser } from "@worm/types";
import { RuntimeMessage, RuntimeMessageKind } from "@worm/types/src/message";

import { PreactChildren } from "../lib/types";
import { useConfig } from "./Config";

type AuthStore = {
  currentUser: AppUser;
  fetchCurrentUser: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<false | AppUser, Error>>;
};

const Auth = createContext<AuthStore>({} as AuthStore);

export const useAuth = () => useContext(Auth);

export function AuthProvider({ children }: { children: PreactChildren }) {
  const {
    storage: { authLastAuthUser },
  } = useConfig();

  /**
   * Construct the current user object.
   */
  const currentUser = useMemo<AppUser>(() => {
    return authLastAuthUser !== undefined ? { email: authLastAuthUser } : false;
  }, [authLastAuthUser]);

  const { refetch: fetchCurrentUser } = useQuery<AppUser, Error, AppUser>({
    queryKey: ["fetchCurrentUser"],
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
            doResolve(false);
          }
        }, responsePollIntervalMs);

        const doResolve = (response: AppUser) => {
          clearInterval(responsePoll);
          resolve(response);
        };

        const messageHandler = (event: RuntimeMessage<RuntimeMessageKind>) => {
          switch (event.data.kind) {
            case "currentUserResponse": {
              doResolve(event.data.details?.data ?? false);
              break;
            }

            default:
              doResolve(false);
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

  return (
    <Auth.Provider value={{ currentUser, fetchCurrentUser }}>
      {children}
    </Auth.Provider>
  );
}
