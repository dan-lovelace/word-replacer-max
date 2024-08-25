import { createContext } from "preact";
import {
  StateUpdater,
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import {
  createWebAppMessage,
  elementIdentifiers,
  getApiEndpoint,
  isWebAppMessagingAllowed,
  webAppMessages,
} from "@worm/shared";
import { ApiAuthTokensResponse } from "@worm/types";

type AuthUser = {
  email: string;
};

type AuthStoreContextProps = {
  appUser?: AuthUser;
  fetchTokens: (code: string) => void;
  setAppUser: StateUpdater<AuthUser | undefined>;
};

type AuthStoreProps = JSXInternal.HTMLAttributes<HTMLDivElement>;

const AuthStoreContext = createContext<AuthStoreContextProps>(
  {} as AuthStoreContextProps
);

const useValue = () => {
  const [appUser, setAppUser] = useState<AuthUser>();

  const fetchTokens = async (code: string) => {
    const response = await fetch(getApiEndpoint("AUTH_TOKENS"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data);
    }

    return data as ApiAuthTokensResponse;
  };

  return {
    appUser,
    fetchTokens,
    setAppUser,
  };
};

export const useAuthStore = () => useContext(AuthStoreContext);

export function AuthStore({ children }: AuthStoreProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const value = useValue();

  useEffect(() => {
    if (!iframeRef.current) return;

    iframeRef.current.contentWindow?.addEventListener(
      "message",
      async (event) => {
        if (!isWebAppMessagingAllowed(window.location.hostname)) {
          return;
        }

        switch (event.data.kind) {
          case webAppMessages.CONTENT_INITIALIZE: {
            const queryParams = new URLSearchParams(window.location.search);
            const code = queryParams.get("code");

            if (code) {
              const tokensResult = await value.fetchTokens(code);
              const newMessage = createWebAppMessage(
                "authTokens",
                tokensResult
              );
              iframeRef.current?.contentWindow?.postMessage(newMessage);
            }
            break;
          }
        }
      }
    );
  }, [iframeRef]);

  return (
    <AuthStoreContext.Provider value={value}>
      {children}
      <iframe
        className="hidden"
        id={elementIdentifiers.WEBAPP_MESSAGE_IFRAME}
        ref={iframeRef}
      ></iframe>
    </AuthStoreContext.Provider>
  );
}
