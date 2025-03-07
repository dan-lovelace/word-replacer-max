import { AuthError, decodeJWT, signOut } from "aws-amplify/auth";

import {
  createRuntimeMessage,
  createWebAppMessage,
  logDebug,
} from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import {
  browser,
  sendConnectMessage,
  sendTabMessage,
} from "@worm/shared/src/browser";
import {
  authStorageProvider,
  storageGetByKeys,
} from "@worm/shared/src/storage";
import { ApiAuthTokens } from "@worm/types/src/api";
import { IdentificationError } from "@worm/types/src/identity";
import {
  ErrorableMessage,
  HTMLReplaceRequest,
  HTMLReplaceResponse,
  RuntimeMessage,
  RuntimeMessageKind,
  WebAppMessageData,
  WebAppMessageKind,
} from "@worm/types/src/message";
import { UserTokens } from "@worm/types/src/permission";

import { handleReplaceRequest } from "../../../replace/replace-html";

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

/**
 * IMPORTANT: Note usage of the `chrome` namespace over the polyfill. This is
 * intentional because the offscreen API is specific to Chrome.
 */
let creating: Promise<void> | null; // A global promise to avoid concurrency issues

/**
 * Creates an offscreen document required by MV3 and waits for it to be ready
 * to receive messages.
 */
async function setupOffscreenDocument(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    /**
     * Add a runtime message listener with a timeout to listen for ready
     * responses from the offscreen page.
     */
    // const readyResponseTimeout = setTimeout(() => {
    //   reject(new Error("Timed out waiting for offscreen document to respond"));
    // }, 6000);

    // const messageListener = (message: any) => {
    //   const event = message as WebAppMessage<WebAppMessageKind>;

    //   if (event.data.kind === "offscreenReadyResponse") {
    //     clearTimeout(readyResponseTimeout);
    //     // offscreenReady = true;
    //     browser.runtime.onMessage.removeListener(messageListener);

    //     console.log("got response, resolving");
    //     resolve();
    //   }

    //   return undefined;
    // };

    // browser.runtime.onMessage.addListener(messageListener);

    /**
     * Repeatedly sends a ready request to the offscreen page until a message
     * is successfully sent. We don't care if or when it responds, just that
     * sending messages to it does not throw an error. This satisfies its
     * readiness enough at this point.
     *
     * Polling is used instead of waiting for a response because the whole need
     * for this arose from sending messages too early. The fastest way to
     * proceed is to only wait long enough for a handshake.
     */
    const sendReadyRequest = () => {
      const readyRequest = createWebAppMessage(
        "offscreenReadyRequest",
        undefined,
        ["offscreen"]
      );

      const started = Date.now();
      const maxWaitMs = 6000;

      const messagePoll = setInterval(() => {
        const now = Date.now();

        if (now - started >= maxWaitMs) {
          reject(new Error("Timeout waiting for offscreen ready check"));
        }

        browser.runtime
          .sendMessage({ data: readyRequest })
          .then(() => {
            clearInterval(messagePoll);
            resolve();
          })
          .catch(() => {
            // silently ignore any errors while polling
          });
      }, 2);
    };

    const offscreenPath = "offscreen-mv3.html";
    const offscreenUrl = chrome.runtime.getURL(offscreenPath);

    try {
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [offscreenUrl],
      });

      if (existingContexts.length > 0) {
        // Document exists but it may not be ready for messages yet
        sendReadyRequest();
        return;
      }

      // Create document if it doesn't exist
      if (creating) {
        await creating;
      } else {
        creating = chrome.offscreen.createDocument({
          url: offscreenPath,
          reasons: [chrome.offscreen.Reason.DOM_PARSER],
          justification: "Parsing DOM contents for text replacement",
        });

        await creating;
        creating = null;
      }

      // Document finished creating but may not be ready for messages
      sendReadyRequest();
    } catch (error) {
      // clearTimeout(readyResponseTimeout);
      reject(error);
    }
  });
}

export function startConnectListener() {
  browser.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(async (message) => {
      const event = message as RuntimeMessage<RuntimeMessageKind>;

      if (
        event.data.targets !== undefined &&
        !event.data.targets.includes("background")
      ) {
        return;
      }

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

        // case "htmlReplaceRequest": {
        //   const requestData = event.data.details as HTMLReplaceRequest;
        //   const isManifestV3 =
        //     browser.runtime.getManifest().manifest_version === 3;

        //   if (isManifestV3) {
        //     /**
        //      * Manifest v3 does not expose DOMParser in the service worker. To
        //      * perform replacements on request data, we send a message to an
        //      * offscreen document and wait for it to send a response back
        //      * containing the replacements.
        //      */
        //     await setupOffscreenDocument();

        //     sendConnectMessage(
        //       "background",
        //       "htmlReplaceRequest",
        //       requestData,
        //       ["offscreen"]
        //     );
        //   } else {
        //     /**
        //      * Manifest v2 in use so the service worker is embedded in a
        //      * background HTML page where DOMParser is available directly. We
        //      * are able to parse request data in this context without having to
        //      * commit to using another document for replacement.
        //      */

        //     // TODO: process html string
        //     const responseData = handleReplaceRequest(requestData);

        //     sendTabMessage(
        //       "htmlReplaceResponse",
        //       {
        //         data: responseData,
        //       },
        //       ["content"]
        //     );
        //   }

        //   break;
        // }

        case "htmlReplaceResponse": {
          /**
           * Manifest v3 only. The offscreen document is responding with its
           * results from parsing HTML string contents.
           */
          const { data: responseData } = event.data
            .details as ErrorableMessage<HTMLReplaceResponse>;

          sendTabMessage(
            "htmlReplaceResponse",
            {
              data: responseData,
            },
            ["content"]
          );

          break;
        }

        case "replacerStorageRequest": {
          const syncStorage = await storageGetByKeys();
          console.log("FETCHING STORAGE FRESH");
          const responseMessage = createRuntimeMessage(
            "replacerStorageResponse",
            {
              data: {
                sync: syncStorage,
              },
            }
          );
          port.postMessage({ data: responseMessage });

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
  browser.runtime.onMessage.addListener(async (message, sender) => {
    const event = message as WebAppMessageData<WebAppMessageKind>;

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

      case "authUpdateTokensRequest": {
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
          await authStorageProvider.set({
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

          sendTabMessage("authUpdateTokensResponse", {
            data: {
              accessToken: tokens.accessToken,
              idToken: tokens.accessToken,
            },
          });
        } catch (error) {
          logDebug(error);

          sendTabMessage("authUpdateTokensResponse", {
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

      case "htmlReplaceRequest": {
        const requestData = event.details as HTMLReplaceRequest;
        const isManifestV3 =
          browser.runtime.getManifest().manifest_version === 3;
        const senderId = sender.tab?.id;

        if (!senderId) {
          throw new Error("Unable to find sender ID");
        }

        if (isManifestV3) {
          /**
           * Manifest v3 does not expose DOMParser in the service worker. To
           * perform replacements on request data, we send a message to an
           * offscreen document and wait for it to send a response back
           * containing the replacements.
           */
          await setupOffscreenDocument();

          sendConnectMessage("background", "htmlReplaceRequest", requestData, [
            "offscreen",
          ]);
        } else {
          /**
           * Manifest v2 in use so the service worker is embedded in a
           * background HTML page where DOMParser is available directly. We
           * are able to parse request data in this context without having to
           * commit to using another document for replacement.
           */

          // TODO: process html string
          const responseData = handleReplaceRequest(requestData);

          sendTabMessage(
            "htmlReplaceResponse",
            {
              data: responseData,
            },
            ["content"]
          );
        }

        break;
      }

      case "pingRequest": {
        sendTabMessage("pingResponse", true);

        break;
      }
    }
  });
}
