import { createContext } from "preact";
import { useContext, useEffect } from "preact/hooks";

import {
  connectionManager,
  ConnectMessageSender,
} from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { RuntimeMessage, RuntimeMessageKind } from "@worm/types/src/message";

import { PreactChildren } from "../lib/types";

import { useConfig } from "./Config";

type MessageStore = {};

const MESSAGE_SENDER: ConnectMessageSender = "popup-store-message";

const Message = createContext<MessageStore>({} as MessageStore);

export const useMessage = () => useContext(Message);

export function MessageProvider({ children }: { children: PreactChildren }) {
  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();

  useEffect(() => {
    const messageHandler = (event: RuntimeMessage<RuntimeMessageKind>) => {
      switch (event.data.kind) {
        case "signOutResponse": {
          if (preferences?.activeTab === "account") {
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
  }, [preferences]);

  return <Message.Provider value={{}}>{children}</Message.Provider>;
}
