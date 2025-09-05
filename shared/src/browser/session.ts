import { v4 as uuidv4 } from "uuid";

import {
  RuntimeMessage,
  RuntimeMessageKind,
} from "@wordreplacermax/types/src/message";
import { UserTokens } from "@wordreplacermax/types/src/permission";

import { connectionManager, ConnectMessageSender } from "./connect";

type FetchAuthTokensResponse = UserTokens | undefined;

/**
 * Fetches auth tokens from the background script by sending a request and
 * waiting for a response. There is a timeout mechanism that will exit early if
 * no response is received.
 */
export async function fetchAuthTokens(): Promise<FetchAuthTokensResponse> {
  /**
   * Generate a unique sender to avoid clashing with other in-flight messages.
   */
  const messageSender: ConnectMessageSender = uuidv4();

  return new Promise((resolve) => {
    const responsePollStarted = new Date().getTime();
    const responsePollIntervalMs = 10;
    const responsePollLengthMs = 2000;

    const responsePoll = setInterval(() => {
      if (new Date().getTime() - responsePollStarted > responsePollLengthMs) {
        doResolve(undefined);
      }
    }, responsePollIntervalMs);

    const cleanup = () => {
      connectionManager.removeMessageHandler(messageSender, messageHandler);
      clearInterval(responsePoll);
    };

    const doResolve = (response: FetchAuthTokensResponse) => {
      cleanup();
      resolve(response);
    };

    const messageHandler = (event: RuntimeMessage<RuntimeMessageKind>) => {
      switch (event.data.kind) {
        case "authTokensResponse": {
          const tokens = event.data.details?.data as UserTokens;

          doResolve(tokens);
          break;
        }
      }
    };

    connectionManager.addMessageHandler(messageSender, messageHandler);
    connectionManager.connect(messageSender);

    connectionManager.sendMessage(messageSender, "authTokensRequest");
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const authTokens = await fetchAuthTokens();

  return authTokens?.accessToken;
}
