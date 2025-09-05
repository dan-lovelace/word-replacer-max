import { createContext } from "preact";
import { useContext, useEffect, useRef } from "preact/hooks";

import {
  connectionManager,
  ConnectMessageSender,
} from "@web-extension/shared/src/browser";
import { storageSetByKeys } from "@web-extension/shared/src/storage";
import {
  RuntimeMessage,
  RuntimeMessageKind,
} from "@wordreplacermax/types/src/message";
import { PopupTab } from "@wordreplacermax/types/src/popup";

import { PreactChildren } from "../lib/types";

import { useConfig } from "./Config";

type MessageStore = {};

export const MESSAGE_SENDER: ConnectMessageSender = "popup";

const Message = createContext<MessageStore>({} as MessageStore);

export const useMessage = () => useContext(Message);

export function MessageProvider({ children }: { children: PreactChildren }) {
  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();

  const activeTabRef = useRef<PopupTab | undefined>(preferences?.activeTab);
  activeTabRef.current = preferences?.activeTab;

  useEffect(() => {
    const messageHandler = (event: RuntimeMessage<RuntimeMessageKind>) => {
      switch (event.data.kind) {
        case "signOutResponse": {
          if (activeTabRef.current === "account") {
            const newPreferences = Object.assign({}, preferences);
            newPreferences.activeTab = "rules";

            storageSetByKeys({
              preferences: newPreferences,
            });
          }

          break;
        }
      }
    };

    connectionManager.addMessageHandler(MESSAGE_SENDER, messageHandler);
    connectionManager.connect(MESSAGE_SENDER);

    return () => {
      connectionManager.removeMessageHandler(MESSAGE_SENDER, messageHandler);
    };
  }, []);

  return <Message.Provider value={{}}>{children}</Message.Provider>;
}
