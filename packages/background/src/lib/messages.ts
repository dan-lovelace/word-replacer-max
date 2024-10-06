import {
  AuthError,
  decodeJWT,
  fetchAuthSession,
  signOut,
} from "aws-amplify/auth";

import {
  createRuntimeMessage,
  createWebAppMessage,
  logDebug,
} from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import { browser, sendConnectMessage } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { ApiAuthTokens, IdentificationError } from "@worm/types";
import {
  RuntimeMessage,
  RuntimeMessageKind,
  WebAppMessageData,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";

import "./auth/amplify";
import { getCurrentUser, signUserOut } from "./auth/amplify";

let runtimePort: browser.Runtime.Port;

function getError(error: unknown) {
  let errorMessage: string;
  let errorName: string;

  if (error instanceof AuthError || error instanceof Error) {
    errorMessage = error.message;
    errorName = error.name;
  } else if (typeof error === "string") {
    errorMessage = error;
    errorName = "AuthUserRequest";
  } else {
    errorMessage = "Something went wrong";
    errorName = "AuthUserRequest";
  }

  return {
    message: errorMessage,
    name: errorName,
  };
}

async function sendTabMessage<T extends WebAppMessageKind>(
  kind: T,
  details?: WebAppMessageKindMap[T]
) {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab) {
    logDebug("Unable to locate active tab");
    return;
  }

  return browser.tabs.sendMessage(
    Number(tab.id),
    createWebAppMessage(kind, details)
  );
}

export function startConnectListener() {
  browser.runtime.onConnect.addListener((connectionPort) => {
    runtimePort = connectionPort;

    runtimePort.onMessage.addListener(
      async (event: RuntimeMessage<RuntimeMessageKind>) => {
        switch (event.data.kind) {
          case "currentUserRequest": {
            try {
              const currentUser = await getCurrentUser();

              if (currentUser === undefined) {
                throw new IdentificationError("UserNotLoggedIn");
              }

              const responseMessage = createRuntimeMessage(
                "currentUserResponse",
                {
                  data: currentUser,
                }
              );
              runtimePort.postMessage({ data: responseMessage });
            } catch (error) {
              const responseMessage = createRuntimeMessage(
                "currentUserResponse",
                {
                  error: getError(error),
                }
              );
              runtimePort.postMessage({ data: responseMessage });
            }

            break;
          }

          case "signOut": {
            await signUserOut();

            break;
          }
        }
      }
    );
  });
}

export function startMessageListener() {
  browser.runtime.onMessage.addListener(
    async (event: WebAppMessageData<WebAppMessageKind>, sender) => {
      switch (event.kind) {
        case "authSignOutRequest": {
          try {
            await signOut();

            sendTabMessage("authSignOutResponse", { data: true });
          } catch (error) {
            logDebug(error);

            sendTabMessage("authSignOutResponse", {
              error: getError(error),
            });
          }

          break;
        }

        case "authUpdateTokens": {
          /**
           * Auth tokens received from auth.js script.
           */
          try {
            const tokens = event.details as ApiAuthTokens;

            if (!tokens) {
              throw new IdentificationError("MissingTokens");
            }

            /**
             * Ensure protected API requests succeed with the received token.
             */
            const response = await fetch(getApiEndpoint("AUTH_WHOAMI"), {
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
              method: "GET",
            });

            if (!response.ok) {
              throw new IdentificationError();
            }

            /**
             * Update storage using our own keys, not Amplify's. These are
             * translated in the custom token provider.
             */
            await storageSetByKeys({
              authAccessToken: tokens.accessToken,
              authIdToken: tokens.idToken,
              authLastAuthUser: decodeJWT(
                String(tokens.idToken)
              ).payload.email?.toString(),
              authRefreshToken: tokens.refreshToken,
            });

            /**
             * Now that storage is updated, ensure fetching the Amplify session
             * succeeds.
             */
            await fetchAuthSession();

            sendTabMessage("authTokensResponse", {
              data: {
                accessToken: tokens.accessToken,
                idToken: tokens.accessToken,
              },
            });
          } catch (error) {
            logDebug(error);

            sendTabMessage("authTokensResponse", {
              error: getError(error),
            });
          }

          break;
        }

        case "authUserRequest": {
          try {
            const authSession = await fetchAuthSession();
            const email =
              authSession.tokens?.idToken?.payload.email?.toString();

            if (!email) {
              throw new IdentificationError("UserNotLoggedIn");
            }

            sendTabMessage("authUserResponse", {
              data: { email },
            });
          } catch (error) {
            if (
              error instanceof IdentificationError &&
              error.name !== "UserNotLoggedIn"
            ) {
              /**
               * An unexpected identification error was thrown.
               */
              logDebug(error);
            }

            sendTabMessage("authUserResponse", { error: getError(error) });
          }

          break;
        }

        case "pingRequest": {
          sendTabMessage("pingResponse", true);

          break;
        }
      }
    }
  );
}
