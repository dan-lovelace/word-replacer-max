import {
  BaseMessage,
  BaseMessageTargets,
  RuntimeMessageKind,
  RuntimeMessageKindMap,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@wordreplacermax/types/src/message";

import { elementIdentifiers } from "./selectors";

export const TOAST_MESSAGE_DURATION_DEFAULT_MS = 4000;

function createBaseMessage<T extends string, K extends Record<T, unknown>>(
  kind: T,
  details?: K[T],
  targets?: BaseMessageTargets
): BaseMessage<T, K>["data"] {
  return { kind, details, targets };
}

export function createRuntimeMessage<T extends RuntimeMessageKind>(
  kind: T,
  details?: RuntimeMessageKindMap[T],
  targets?: BaseMessageTargets
): BaseMessage<T, RuntimeMessageKindMap>["data"] {
  return createBaseMessage<T, RuntimeMessageKindMap>(kind, details, targets);
}

export function createWebAppMessage<T extends WebAppMessageKind>(
  kind: T,
  details?: WebAppMessageKindMap[T],
  targets?: BaseMessageTargets
): BaseMessage<T, WebAppMessageKindMap>["data"] {
  return createBaseMessage<T, WebAppMessageKindMap>(kind, details, targets);
}

export function getWebAppIFrame() {
  const elementQuery = document.getElementById(
    elementIdentifiers.CONNECTION_IFRAME
  );

  if (elementQuery && elementQuery.nodeName === "IFRAME") {
    return elementQuery as HTMLIFrameElement;
  }
}
