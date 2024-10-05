import { createContext } from "preact";
import { useContext, useEffect, useMemo } from "preact/hooks";

import { useQuery } from "@tanstack/react-query";

import { createRuntimeMessage } from "@worm/shared";
import { browser } from "@worm/shared/src/browser";
import { AppUser } from "@worm/types";
import { RuntimeMessage, RuntimeMessageKind } from "@worm/types/src/message";

import { PreactChildren } from "../lib/types";

import { useConfig } from "./Config";

type AuthStore = {
  currentUser: AppUser;
  isLoggedIn: boolean;
};

const storeDefaults: AuthStore = {
  currentUser: undefined,
  isLoggedIn: false,
};

const Auth = createContext<AuthStore>(storeDefaults);

export const useAuth = () => useContext(Auth);

export function AuthProvider({ children }: { children: PreactChildren }) {
  const {
    storage: { currentUser },
  } = useConfig();
  const isLoggedIn = useMemo(() => currentUser !== undefined, [currentUser]);

  const { data, refetch: fetchCurrentUser } = useQuery<
    AppUser | false,
    Error,
    AppUser
  >({
    enabled: Boolean(currentUser),
    queryFn: async () => {
      const port = browser.runtime.connect({ name: "popup" });

      return new Promise((resolve) => {
        const userRequest = createRuntimeMessage("currentUserRequest");
        port.postMessage({ data: userRequest });

        port.onMessage.addListener(
          (event: RuntimeMessage<RuntimeMessageKind>) => {
            switch (event.data.kind) {
              case "currentUserResponse": {
                resolve(event.data.details?.data);
                break;
              }

              default:
                resolve(false);
            }
          }
        );
      });
    },
    queryKey: ["getCurrentUser"],
    retry: false,
  });

  useEffect(() => {
    function pingCurrentUser() {
      fetchCurrentUser();
    }

    pingCurrentUser();

    const handleWindowFocus = () => {
      pingCurrentUser();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  return (
    <Auth.Provider value={{ currentUser, isLoggedIn }}>
      <div>Data: {JSON.stringify(data)}</div>
      {children}
    </Auth.Provider>
  );
}
