import { useEffect, useState } from "react";

import {
  createWebAppMessage,
  getWebAppIFrame,
  webAppMessages,
} from "@worm/shared";

import { useAuthTokens } from "../lib/auth/queries";
import { useToast } from "../lib/toast/ToastProvider";

const CODE_PARAMETER_NAME = "code";

export default function LoginCallbackPage() {
  const [oauthCode, setOauthCode] = useState<string>();
  const { refetch: fetchAuthTokens } = useAuthTokens(oauthCode);
  const { showMessage } = useToast();

  useEffect(() => {
    function init() {
      const url = new URL(window.location.href);
      const queryCode = url.searchParams.get(CODE_PARAMETER_NAME)?.trim();

      if (queryCode) {
        setOauthCode(queryCode);

        /**
         * Remove the code from history for security.
         */
        url.searchParams.delete(CODE_PARAMETER_NAME);
        window.history.replaceState({}, "", url);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!oauthCode) return;

    async function getTokens() {
      const result = await fetchAuthTokens();

      if (result.isError) {
        return showMessage(
          `Error getting tokens: ${result.error.message}`,
          "error"
        );
      }

      if (result.isSuccess) {
        const successMessage = createWebAppMessage(
          webAppMessages.AUTH_TOKENS,
          result.data
        );

        const iframe = getWebAppIFrame();
        iframe?.contentWindow?.postMessage(successMessage);
      }
    }

    getTokens();
  }, [oauthCode]);

  return (
    <>
      <a href={import.meta.env.VITE_SIGN_IN_URL}>Return to login</a>
    </>
  );
}
