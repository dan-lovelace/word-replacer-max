import { createContext, useContext, useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box/Box";

import {
  createWebAppMessage,
  elementIdentifiers,
  isWebAppMessagingAllowed,
} from "@worm/shared";
import { AppUser, WebAppPingResponse } from "@worm/types";
import {
  ErrorableMessage,
  ShowToastMessageOptions,
  WebAppMessage,
  WebAppMessageData,
  WebAppMessageKind,
} from "@worm/types/src/message";

import { useToast } from "../toast/ToastProvider";

import { useConnectionPing } from "./queries";

type ConnectionProviderContextProps = {
  appUser?: AppUser;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isConnected: boolean;
  isConnecting: boolean;
  sendMessage: (message: WebAppMessageData<WebAppMessageKind>) => void;
};

type ConnectionProviderProps = React.HTMLAttributes<HTMLDivElement>;

const ConnectionProviderContext = createContext<ConnectionProviderContextProps>(
  {} as ConnectionProviderContextProps
);

const useConnectionProviderValue = (
  iframeRef: React.RefObject<HTMLIFrameElement>
): ConnectionProviderContextProps => {
  const [appUser, setAppUser] = useState<AppUser>();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const { refetch: ping } = useConnectionPing(iframeRef);
  const { showToast } = useToast();

  /**
   * This is the root listener on the webapp side for all communications
   * between it and browser extension.
   */
  useEffect(() => {
    if (!iframeRef.current) return;

    const handleMessageEvent = async (
      event: WebAppMessage<WebAppMessageKind>
    ) => {
      if (!isWebAppMessagingAllowed(window.location.hostname)) {
        return;
      }

      switch (event.data.kind) {
        case "authUserResponse": {
          const userResponse = event.data.details as ErrorableMessage<AppUser>;

          if (userResponse.error) {
            return showToast(userResponse.error.message, "danger");
          }

          setAppUser(userResponse.data);
          break;
        }

        case "contentInitialize": {
          sendMessage(createWebAppMessage("pingRequest"));
          break;
        }

        case "pingResponse": {
          const pingResponse = event.data.details as WebAppPingResponse;

          setIsConnected(pingResponse);
          setIsConnecting(false);
          break;
        }

        case "showToastMessage": {
          const showToastOptions = event.data
            .details as ShowToastMessageOptions;

          showToast(
            showToastOptions.message,
            showToastOptions.options?.severity
          );
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

  /**
   * Listen for window focus events and re-test the connection.
   */
  useEffect(() => {
    const handleFocus = () => {
      ping();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [ping]);

  const sendMessage = (message: WebAppMessageData<WebAppMessageKind>) => {
    iframeRef.current?.contentWindow?.postMessage(message);
  };

  return {
    appUser,
    iframeRef,
    isConnected,
    isConnecting,
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
