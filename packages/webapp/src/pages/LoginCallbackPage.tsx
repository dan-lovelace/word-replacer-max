import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createWebAppMessage } from "@worm/shared";

import PageLoader from "../components/loader/PageLoader";
import { useAuthProvider } from "../lib/auth/AuthProvider";
import { useAuthTokens } from "../lib/auth/queries";
import { useConnectionProvider } from "../lib/connection/ConnectionProvider";
import { ROUTES } from "../lib/routes";
import { useToast } from "../lib/toast/ToastProvider";

const CODE_PARAMETER_NAME = "code";

const ERROR_PARAMETER_NAME = "error_description";

export default function LoginCallbackPage() {
  const [oauthCode, setOauthCode] = useState<string>();

  const { setSignInStatus } = useAuthProvider();
  const { isPending: isLoadingAuthTokens, mutate: fetchAuthTokens } =
    useAuthTokens();
  const { connectionStatus, sendMessage } = useConnectionProvider();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    function init() {
      const url = new URL(window.location.href);

      const queryCode = url.searchParams.get(CODE_PARAMETER_NAME)?.trim();
      const queryError = url.searchParams.get(ERROR_PARAMETER_NAME)?.trim();

      if (queryCode) {
        /**
         * Remove the code from history for safety.
         */
        url.searchParams.delete(CODE_PARAMETER_NAME);
        window.history.replaceState({}, "", url);

        setOauthCode(queryCode);
      }

      if (queryError) {
        navigate(ROUTES.HOME);
        showToast(queryError, "danger");
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (connectionStatus !== "connected" || !oauthCode) return;

    async function getTokens() {
      if (!oauthCode) return;

      setSignInStatus("signingIn");

      fetchAuthTokens(
        { code: oauthCode },
        {
          onError({ response }) {
            const message =
              response?.data.error?.message ??
              "Something went wrong fetching tokens";

            showToast(`Error getting tokens: ${message}`, "danger");
          },
          onSuccess({ data: response }) {
            const successMessage = createWebAppMessage(
              "authUpdateTokensRequest",
              response?.data
            );
            sendMessage(successMessage);

            handleLoginSuccess();
          },
        }
      );
    }

    getTokens();
  }, [connectionStatus, oauthCode]);

  const handleLoginSuccess = () => {
    navigate(ROUTES.LOGIN_SUCCESS, {
      replace: true,
    });
  };

  if (isLoadingAuthTokens) {
    return <PageLoader heading="Signing you in..." />;
  }

  return false;
}
