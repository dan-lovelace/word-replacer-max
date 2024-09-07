import {
  WebAppMessageData,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";

import { elementIdentifiers } from "./selectors";

type WebAppMessageLabel =
  | "AUTH_TOKENS"
  | "CONTENT_INITIALIZE"
  | "PING_REQUEST"
  | "PING_RESPONSE"
  | "SHOW_TOAST_MESSAGE";

export const TOAST_MESSAGE_DURATION_DEFAULT_MS = 4000;

export const webAppMessages: Record<
  WebAppMessageLabel,
  keyof WebAppMessageKindMap
> = {
  AUTH_TOKENS: "authTokens",
  CONTENT_INITIALIZE: "contentInitialize",
  PING_REQUEST: "pingRequest",
  PING_RESPONSE: "pingResponse",
  SHOW_TOAST_MESSAGE: "showToastMessage",
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
