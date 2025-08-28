import { AuthError, decodeJWT, signOut } from "aws-amplify/auth";

import {
  createRuntimeMessage,
  createWebAppMessage,
  logDebug,
} from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import { browser } from "@worm/shared/src/browser";
import { processReplacements } from "@worm/shared/src/service-worker";
import { authStorageProvider } from "@worm/shared/src/storage";
import { ApiAuthTokens } from "@worm/types/src/api";
import { IdentificationError } from "@worm/types/src/identity";
import {
  RuntimeMessage,
  RuntimeMessageKind,
  WebAppMessageData,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";
import { UserTokens } from "@worm/types/src/permission";

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
    port.onMessage.addListener(async (message) => {
      const event = message as RuntimeMessage<RuntimeMessageKind>;

      switch (event.data.kind) {
        case "authTokensRequest": {
          try {
            const tokensResponse = await getAuthTokens();

            // stringify tokens since Amplify methods will be lost in the response
            const tokensData: UserTokens = {
              accessToken: tokensResponse?.accessToken.toString() ?? "",
              idToken: tokensResponse?.idToken?.toString() ?? "",
            };

            if (
              !Object.prototype.hasOwnProperty.call(tokensData, "accessToken")
            ) {
              throw new IdentificationError();
            }

            const responseMessage = createRuntimeMessage("authTokensResponse", {
              data: tokensData,
            });
            port.postMessage({ data: responseMessage });
          } catch (error) {
            const responseMessage = createRuntimeMessage("authTokensResponse", {
              error: getError(error),
            });
            port.postMessage({ data: responseMessage });
          }

          break;
        }

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
    });
  });
}

export function startMessageListener() {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const event = message as WebAppMessageData<WebAppMessageKind>;

    switch (event.kind) {
      case "authSignOutRequest": {
        signOut()
          .then(() => {
            sendTabMessage("authSignOutResponse", { data: true });
          })
          .catch((error) => {
            logDebug(error);

            sendTabMessage("authSignOutResponse", {
              error: getError(error),
            });
          });

        break;
      }

      case "authUpdateTokensRequest": {
        /**
         * Auth tokens received from auth.js script.
         */
        const tokens = event.details as ApiAuthTokens;

        if (!tokens) {
          const error = new IdentificationError("MissingTokens");

          logDebug(error);
          sendTabMessage("authUpdateTokensResponse", {
            error: getError(error),
          });
        }

        /**
         * Ensure protected API requests succeed with the received token.
         */
        fetch(getApiEndpoint("GET:authWhoAmI"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new IdentificationError();
            }

            /**
             * Update storage using our own keys, not Amplify's. These are
             * translated in the custom token provider.
             */
            return authStorageProvider.set({
              authAccessToken: tokens.accessToken,
              authIdToken: tokens.idToken,
              authLastAuthUser: decodeJWT(
                String(tokens.idToken)
              ).payload.email?.toString(),
              authRefreshToken: tokens.refreshToken,
            });
          })
          .then(() => {
            /**
             * Now that storage is updated, ensure fetching the Amplify session
             * succeeds.
             */
            return getCurrentUser();
          })
          .then(() => {
            sendTabMessage("authUpdateTokensResponse", {
              data: {
                accessToken: tokens.accessToken,
                idToken: tokens.accessToken,
              },
            });
          })
          .catch((error) => {
            logDebug(error);
            sendTabMessage("authUpdateTokensResponse", {
              error: getError(error),
            });
          });

        break;
      }

      case "authUserRequest": {
        getCurrentUser()
          .then((currentUser) => {
            if (!currentUser) {
              throw new IdentificationError("UserNotLoggedIn");
            }

            sendTabMessage("authUserResponse", {
              data: currentUser,
            });
          })
          .catch((error) => {
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
          });

        break;
      }

      case "pingRequest": {
        sendTabMessage("pingResponse", true);

        break;
      }

      case "processReplacementsRequest": {
        processReplacements(event, sendResponse);
        return true;
      }
    }

    return undefined;
  });
}
