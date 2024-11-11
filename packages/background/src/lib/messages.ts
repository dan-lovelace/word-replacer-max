import { AuthError, decodeJWT, signOut } from "aws-amplify/auth";

import {
  createRuntimeMessage,
  createWebAppMessage,
  logDebug,
} from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import { browser } from "@worm/shared/src/browser";
import { getStorageProvider } from "@worm/shared/src/storage";
import { ApiAuthTokens } from "@worm/types/src/api";
import { IdentificationError } from "@worm/types/src/identity";
import {
  RuntimeMessage,
  RuntimeMessageKind,
  WebAppMessageData,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";

import { getAuthTokens, getCurrentUser, signUserOut } from "./auth/session";

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
  browser.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(
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
              port.postMessage({ data: responseMessage });
            } catch (error) {
              const responseMessage = createRuntimeMessage(
                "currentUserResponse",
                {
                  error: getError(error),
                }
              );
              port.postMessage({ data: responseMessage });
            }

            break;
          }

          case "forceRefreshTokensRequest": {
            try {
              await getAuthTokens(true); // forceful fetch to get latest

              const responseMessage = createRuntimeMessage(
                "forceRefreshTokensResponse",
                {
                  data: { success: true },
                }
              );
              port.postMessage({ data: responseMessage });
            } catch (error) {
              const responseMessage = createRuntimeMessage(
                "forceRefreshTokensResponse",
                {
                  error: getError(error),
                }
              );
              port.postMessage({ data: responseMessage });
            }

            break;
          }

          case "signOutRequest": {
            await signUserOut();

            const responseMessage = createRuntimeMessage("signOutResponse");
            port.postMessage({ data: responseMessage });

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
            const response = await fetch(getApiEndpoint("GET:authWhoAmI"), {
              method: "GET",
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
            });

            if (!response.ok) {
              throw new IdentificationError();
            }

            /**
             * Update storage using our own keys, not Amplify's. These are
             * translated in the custom token provider.
             */
            await getStorageProvider("session").set({
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
            await getCurrentUser();

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
            const currentUser = await getCurrentUser();

            if (!currentUser) {
              throw new IdentificationError("UserNotLoggedIn");
            }

            sendTabMessage("authUserResponse", {
              data: currentUser,
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
