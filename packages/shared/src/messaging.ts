import {
  WebAppMessageData,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types";

import { elementIdentifiers } from "./selectors";

type WebAppMessageLabel =
  | "AUTH_TOKENS"
  | "CONTENT_INITIALIZE"
  | "PING_REQUEST"
  | "PING_RESPONSE";

export const webAppMessages: Record<
  WebAppMessageLabel,
  keyof WebAppMessageKindMap
> = {
  AUTH_TOKENS: "authTokens",
  CONTENT_INITIALIZE: "contentInitialize",
  PING_REQUEST: "pingRequest",
  PING_RESPONSE: "pingResponse",
};

export function createWebAppMessage<T extends WebAppMessageKind>(
  kind: T,
  details?: WebAppMessageKindMap[T]
): WebAppMessageData<T> {
  return { kind, details };
}

export function getWebAppIFrame() {
  const elementQuery = document.getElementById(
    elementIdentifiers.CONNECTION_IFRAME
  );

  if (elementQuery && elementQuery.nodeName === "IFRAME") {
    return elementQuery as HTMLIFrameElement;
  }
}

export function isWebAppMessagingAllowed(hostname: string) {
  return import.meta.env.VITE_ALLOWED_CONTENT_ORIGINS.includes(hostname);
}
