import {
  BaseMessage,
  RuntimeMessageKind,
  RuntimeMessageKindMap,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";

import { getEnvConfig } from "./config";
import { elementIdentifiers } from "./selectors";

export const TOAST_MESSAGE_DURATION_DEFAULT_MS = 4000;

function createBaseMessage<T extends string, K extends Record<T, unknown>>(
  kind: T,
  details?: K[T]
): BaseMessage<T, K>["data"] {
  return { kind, details };
}

export function createRuntimeMessage<T extends RuntimeMessageKind>(
  kind: T,
  details?: RuntimeMessageKindMap[T]
): BaseMessage<T, RuntimeMessageKindMap>["data"] {
  return createBaseMessage<T, RuntimeMessageKindMap>(kind, details);
}

export function createWebAppMessage<T extends WebAppMessageKind>(
  kind: T,
  details?: WebAppMessageKindMap[T]
): BaseMessage<T, WebAppMessageKindMap>["data"] {
  return createBaseMessage<T, WebAppMessageKindMap>(kind, details);
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
