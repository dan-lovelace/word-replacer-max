import { createContext, useContext, useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";

import {
  createWebAppMessage,
  elementIdentifiers,
  isWebAppMessagingAllowed,
  webAppMessages,
} from "@worm/shared";
import {
  WebAppMessage,
  WebAppMessageData,
  WebAppMessageKind,
  WebAppPingResponse,
} from "@worm/types";

import { useConnectionPing } from "./queries";

type ConnectionProviderContextProps = {
  isConnected: boolean;
  sendMessage: (message: WebAppMessageData<WebAppMessageKind>) => void;
};

type ConnectionProviderProps = React.HTMLAttributes<HTMLDivElement>;

const ConnectionProviderContext = createContext<ConnectionProviderContextProps>(
  {} as ConnectionProviderContextProps
);

const useConnectionProviderValue = (
  iframeRef: React.RefObject<HTMLIFrameElement>
): ConnectionProviderContextProps => {
  const [isConnected, setIsConnected] = useState(false);
  const { refetch: ping } = useConnectionPing(iframeRef);

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
        case webAppMessages.CONTENT_INITIALIZE: {
          sendMessage(
            createWebAppMessage(webAppMessages.PING_REQUEST, undefined)
          );
          break;
        }

        case webAppMessages.PING_RESPONSE: {
          const pingResponse = event.data.details as WebAppPingResponse;

          setIsConnected(pingResponse);
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
    isConnected,
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
