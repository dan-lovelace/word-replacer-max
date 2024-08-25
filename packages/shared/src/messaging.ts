import { WebAppMessage, WebAppMessageKindMap } from "@worm/types";

import { elementIdentifiers } from "./selectors";

type WebAppMessageKindLabel = "AUTH_TOKENS" | "CONTENT_INITIALIZE";

export const webAppMessages: Record<
  WebAppMessageKindLabel,
  keyof WebAppMessageKindMap
> = {
  AUTH_TOKENS: "authTokens",
  CONTENT_INITIALIZE: "contentInitialize",
};

export function createWebAppMessage<T extends keyof WebAppMessageKindMap>(
  kind: T,
  data: WebAppMessageKindMap[T]
): WebAppMessage<T> {
  return { kind, data };
}

export function getWebAppIFrame() {
  const elementQuery = document.getElementById(
    elementIdentifiers.WEBAPP_MESSAGE_IFRAME
  );

  if (elementQuery && elementQuery.nodeName === "IFRAME") {
    return elementQuery as HTMLIFrameElement;
  }
}

export function isWebAppMessagingAllowed(hostname: string) {
  return import.meta.env.VITE_ALLOWED_CONTENT_ORIGINS.includes(hostname);
}
