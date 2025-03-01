import { createContext, useContext, useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box/Box";

import { createWebAppMessage, elementIdentifiers } from "@worm/shared";
import { isWebAppMessagingAllowed } from "@worm/shared/src/config/webapp";
import { IdentificationError } from "@worm/types/src/identity";
import {
  ShowToastMessageOptions,
  WebAppMessage,
  WebAppMessageData,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";
import { WebAppPingResponse } from "@worm/types/src/web-app";

import { useAuthProvider } from "../auth/AuthProvider";
import { useToast } from "../toast/ToastProvider";

type ConnectionProviderContextProps = {
  connectionStatus: ConnectionStatusState;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  sendMessage: (message: WebAppMessageData<WebAppMessageKind>) => void;
};

type ConnectionProviderProps = React.HTMLAttributes<HTMLDivElement>;

type ConnectionStatusState = "connected" | "connecting" | "disconnected";

const ConnectionProviderContext = createContext<ConnectionProviderContextProps>(
  {} as ConnectionProviderContextProps
);

const useConnectionProviderValue = (
  iframeRef: React.RefObject<HTMLIFrameElement | null>
): ConnectionProviderContextProps => {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatusState>("connecting");

  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const connectionStatusRef = useRef<ConnectionStatusState>(null);

  const { signInStatus, setAppUser, setSignInStatus } = useAuthProvider();
  const { showToast } = useToast();

  connectionStatusRef.current = connectionStatus;

  /**
   * This is the root listener on the webapp side for all communications
   * between it and browser extension.
   */
  useEffect(() => {
    if (!iframeRef.current) return;

    const handleMessageEvent = async (
      event: WebAppMessage<WebAppMessageKind>
    ) => {
      if (!isWebAppMessagingAllowed(window.location)) {
        return;
      }

      switch (event.data.kind) {
        case "authSignOutResponse": {
          const signOutResponse = event.data
            .details as WebAppMessageKindMap["authSignOutResponse"];

          if (signOutResponse.data) {
            setAppUser(undefined);
            setSignInStatus("signedOut");
          }

          if (signOutResponse.error) {
            showToast(signOutResponse.error.message, "danger");
            setSignInStatus("unknown");
          }
          break;
        }

        case "authUpdateTokensResponse": {
          /**
           * Fetch the current user whenever tokens are updated.
           */
          sendMessage(createWebAppMessage("authUserRequest"));

          break;
        }

        case "authUserResponse": {
          const userResponse = event.data
            .details as WebAppMessageKindMap["authUserResponse"];

          if (userResponse.data) {
            setSignInStatus("signedIn");
            setAppUser(userResponse.data);
          } else {
            if (signInStatus !== "signingIn") {
              setSignInStatus("signedOut");
            }
          }

          if (
            userResponse.error &&
            userResponse.error instanceof IdentificationError &&
            userResponse.error.name !== "UserNotLoggedIn"
          ) {
            showToast(userResponse.error.message, "danger");
          }
          break;
        }

        case "contentInitialize": {
          /**
           * The extension's content script is up and running. A ping request
           * is sent to it. Additionally, the ConnectionProvider listens for
           * the ping request to instantiate a connection timeout.
           */
          sendMessage(createWebAppMessage("pingRequest"));

          break;
        }

        case "pingRequest": {
          /**
           * Start a connection timeout timer to avoid waiting indefinitely for
           * a ping response.
           */
          timeoutRef.current = setTimeout(() => {
            if (connectionStatusRef.current !== "connecting") return;

            setConnectionStatus("disconnected");
          }, 1500);
          break;
        }

        case "pingResponse": {
          const pingResponse = event.data.details as WebAppPingResponse;

          /**
           * NOTE: A ping response of `false` will never occur because the
           * background script only responds `true` if it is able. If the
           * extension is not running, no response will be received.
           */
          setConnectionStatus(pingResponse ? "connected" : "disconnected");

          /**
           * Refresh the user on each ping.
           */
          sendMessage(createWebAppMessage("authUserRequest"));

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          break;
        }

        case "showToastMessage": {
          const showToastOptions = event.data
            .details as ShowToastMessageOptions;

          showToast(
            showToastOptions.message,
            showToastOptions.options?.severity
          );
          break;
        }
      }
    };

    iframeRef.current.contentWindow?.addEventListener(
      "message",
      handleMessageEvent
    );

    return () => {
      iframeRef.current?.contentWindow?.removeEventListener(
        "message",
        handleMessageEvent
      );
    };
  }, [iframeRef]);

  useEffect(() => {
    sendPing();

    /**
     * Listen for window focus events and re-test the connection.
     */
    const handleFocus = () => {
      sendPing();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const sendMessage = (message: WebAppMessageData<WebAppMessageKind>) => {
    iframeRef.current?.contentWindow?.postMessage(message);
  };

  const sendPing = () => {
    sendMessage(createWebAppMessage("pingRequest"));
  };

  return {
    connectionStatus,
    iframeRef,
    sendMessage,
  };
};

export const useConnectionProvider = () =>
  useContext(ConnectionProviderContext);

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const value = useConnectionProviderValue(iframeRef);

  return (
    <ConnectionProviderContext.Provider value={value}>
      {children}
      <Box
        component="iframe"
        id={elementIdentifiers.CONNECTION_IFRAME}
        ref={iframeRef}
        sx={{
          display: "none",
        }}
      />
    </ConnectionProviderContext.Provider>
  );
}
