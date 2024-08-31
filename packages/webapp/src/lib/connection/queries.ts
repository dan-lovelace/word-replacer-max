import { useQuery } from "@tanstack/react-query";

import {
  createWebAppMessage,
  isWebAppMessagingAllowed,
  webAppMessages,
} from "@worm/shared";
import {
  WebAppMessage,
  WebAppMessageKind,
  WebAppPingRequest,
} from "@worm/types";

export const useConnectionPing = (
  iframeRef: React.RefObject<HTMLIFrameElement>
) =>
  useQuery({
    enabled: false,
    queryFn: () =>
      new Promise<boolean>((resolve) => {
        if (
          !iframeRef.current ||
          !isWebAppMessagingAllowed(window.location.hostname)
        ) {
          resolve(false);
          return;
        }

        const handlePingResponse = (
          event: WebAppMessage<WebAppMessageKind>
        ) => {
          if (event.data.kind === webAppMessages.PING_REQUEST) {
            const pingData = event.data.details as WebAppPingRequest;

            iframeRef.current?.contentWindow?.removeEventListener(
              "message",
              handlePingResponse
            );
            resolve(Boolean(pingData));
          }
        };

        iframeRef.current.contentWindow?.addEventListener(
          "message",
          handlePingResponse
        );

        const pingRequest = createWebAppMessage(
          webAppMessages.PING_REQUEST,
          undefined
        );
        iframeRef.current.contentWindow?.postMessage(pingRequest);
      }),
    queryKey: ["connection"],
  });
