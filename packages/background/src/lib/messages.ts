import { AuthError, decodeJWT, fetchAuthSession } from "@aws-amplify/auth";

import { createWebAppMessage, logDebug } from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api/vite";
import { browser } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { ApiAuthTokens } from "@worm/types";
import {
  WebAppMessageData,
  WebAppMessageKind,
  WebAppMessageKindMap,
} from "@worm/types/src/message";

type IdentificationErrorName = "MissingTokens" | "Standard" | "UserNotLoggedIn";

const identificationErrorMessages: Record<IdentificationErrorName, string> = {
  MissingTokens: "Update requires tokens",
  Standard: "Unable to identify user",
  UserNotLoggedIn: "User is not logged in",
};

class IdentificationError extends Error {
  constructor(name: IdentificationErrorName = "Standard") {
    super(identificationErrorMessages[name]);
    this.name = name;

    Object.setPrototypeOf(this, IdentificationError.prototype);
  }
}

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

async function sendRuntimeMessage<T extends WebAppMessageKind>(
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

export function startRuntimeMessageListener() {
  browser.runtime.onMessage.addListener(
    async (event: WebAppMessageData<WebAppMessageKind>) => {
      switch (event.kind) {
        case "authUserRequest": {
          try {
            const authSession = await fetchAuthSession();
            const email =
              authSession.tokens?.idToken?.payload.email?.toString();

            if (!email) {
              throw new IdentificationError("UserNotLoggedIn");
            }

            sendRuntimeMessage("authUserResponse", {
              data: { email },
            });
          } catch (error) {
            sendRuntimeMessage("authUserResponse", { error: getError(error) });
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
              authLastAuthUser: decodeJWT(String(tokens.idToken)).payload.sub,
              authRefreshToken: tokens.refreshToken,
            });

            /**
             * Now that storage is updated, ensure fetching the Amplify session
             * succeeds.
             */
            await fetchAuthSession();

            sendRuntimeMessage("authTokensResponse", {
              data: {
                accessToken: tokens.accessToken,
                idToken: tokens.accessToken,
                refreshToken: tokens.accessToken,
              },
            });
          } catch (error) {
            sendRuntimeMessage("authTokensResponse", {
              error: getError(error),
            });
          }

          break;
        }

        case "pingRequest": {
          sendRuntimeMessage("pingResponse", true);

          break;
        }
      }
    }
  );
}
