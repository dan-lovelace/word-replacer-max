import { useQuery } from "@tanstack/react-query";

import { createWebAppMessage, isWebAppMessagingAllowed } from "@worm/shared";
import { WebAppMessage, WebAppMessageKind } from "@worm/types/src/message";
import { WebAppPingResponse } from "@worm/types";

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

        let timeout: NodeJS.Timeout;

        const handlePingResponse = (
          event: WebAppMessage<WebAppMessageKind>
        ) => {
          if (event.data.kind === "pingResponse") {
            const pingData = event.data.details as WebAppPingResponse;

            iframeRef.current?.contentWindow?.removeEventListener(
              "message",
              handlePingResponse
            );

            clearInterval(timeout);
            resolve(Boolean(pingData));
          }
        };

        iframeRef.current.contentWindow?.addEventListener(
          "message",
          handlePingResponse
        );

        const pingRequest = createWebAppMessage("pingRequest");
        iframeRef.current.contentWindow?.postMessage(pingRequest);

        /**
         * Create a timer so there's a threshold to how long an unanswered ping
         * should linger before considering the connection unalive.
         */
        const now = new Date().getTime();
        timeout = setInterval(() => {
          if (new Date().getTime() - now > 2000) {
            resolve(false);
            clearInterval(timeout);
          }
        }, 50);
      }),
    queryKey: ["connection"],
  });
