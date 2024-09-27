import {
  WebAppMessageData,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";

import { getEnvConfig } from "./config";
import { elementIdentifiers } from "./selectors";

export const TOAST_MESSAGE_DURATION_DEFAULT_MS = 4000;

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

export function isWebAppMessagingAllowed(location: Location) {
  const envConfig = getEnvConfig();

  return (
    new URL(envConfig.VITE_SSM_WEBAPP_ORIGIN).hostname === location.hostname
  );
}
