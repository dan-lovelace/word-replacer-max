import {
  RuntimeMessageKind,
  RuntimeMessageKindMap,
} from "@worm/types/src/message";

import { createRuntimeMessage } from "../messaging";

import { browser } from "./browser";

type ConnectMessageSender = "popup";

const cache: Partial<{
  lastSender: ConnectMessageSender;
  port: browser.Runtime.Port;
}> = {
  lastSender: undefined,
  port: undefined,
};

export function sendConnectMessage<T extends RuntimeMessageKind>(
  from: ConnectMessageSender,
  kind: T,
  details?: RuntimeMessageKindMap[T]
) {
  if (
    cache.port === undefined ||
    cache.lastSender === undefined ||
    cache.lastSender !== from
  ) {
    cache.lastSender = from;
    cache.port = browser.runtime.connect({ name: from });
  }

  const runtimeMessage = createRuntimeMessage(kind, details);
  const { port } = cache;

  port.postMessage({ data: runtimeMessage });
}
