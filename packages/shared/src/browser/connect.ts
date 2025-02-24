import {
  BaseMessageTargets,
  RuntimeMessageKind,
  RuntimeMessageKindMap,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";

import { createRuntimeMessage, createWebAppMessage } from "../messaging";

import { browser } from "./browser";

export type ConnectMessageSender = string;

class ConnectionManager {
  private static instance: ConnectionManager;

  private connections: Map<string, browser.Runtime.Port>;

  private messageHandlers: Map<string, Set<(message: any) => void>>;

  private constructor() {
    this.connections = new Map();
    this.messageHandlers = new Map();
  }

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }

    return ConnectionManager.instance;
  }

  connect(sender: string): browser.Runtime.Port {
    // Close existing connection if it exists
    if (this.connections.has(sender)) {
      this.connections.get(sender)?.disconnect();
    }

    // Create new connection
    const port = browser.runtime.connect({ name: sender });
    this.connections.set(sender, port);

    // Set up message handling
    port.onMessage.addListener((message) => {
      const handlers = this.messageHandlers.get(sender);
      if (handlers) {
        handlers.forEach((handler) => handler(message));
      }
    });

    // Clean up on disconnect
    port.onDisconnect.addListener(() => {
      this.connections.delete(sender);
      this.messageHandlers.delete(sender);
    });

    return port;
  }

  addMessageHandler(sender: string, handler: (message: any) => void) {
    if (!this.messageHandlers.has(sender)) {
      this.messageHandlers.set(sender, new Set());
    }

    this.messageHandlers.get(sender)?.add(handler);
  }

  removeMessageHandler(sender: string, handler: (message: any) => void) {
    this.messageHandlers.get(sender)?.delete(handler);
  }

  sendMessage<T extends RuntimeMessageKind>(
    sender: ConnectMessageSender,
    kind: T,
    details?: RuntimeMessageKindMap[T],
    targets?: BaseMessageTargets
  ) {
    let port = this.connections.get(sender);

    if (!port) {
      port = this.connect(sender);
    }

    const runtimeMessage = createRuntimeMessage(kind, details, targets);
    port.postMessage({ data: runtimeMessage });
  }
}

export const connectionManager = ConnectionManager.getInstance();

export function sendConnectMessage<T extends RuntimeMessageKind>(
  from: ConnectMessageSender,
  kind: T,
  details?: RuntimeMessageKindMap[T],
  targets?: BaseMessageTargets
) {
  connectionManager.sendMessage(from, kind, details, targets);
}

export async function sendTabMessage<T extends WebAppMessageKind>(
  kind: T,
  details?: WebAppMessageKindMap[T],
  targets?: BaseMessageTargets
) {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab) {
    throw new Error("Unable to locate active tab");
  }

  return browser.tabs.sendMessage(
    Number(tab.id),
    createWebAppMessage(kind, details, targets)
  );
}
