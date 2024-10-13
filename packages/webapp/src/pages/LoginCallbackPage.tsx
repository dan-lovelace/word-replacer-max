import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Stack from "@mui/material/Stack/Stack";
import Typography from "@mui/material/Typography/Typography";

import { createWebAppMessage } from "@worm/shared";

import { useAuthProvider } from "../lib/auth/AuthProvider";
import { useAuthTokens } from "../lib/auth/queries";
import { useConnectionProvider } from "../lib/connection/ConnectionProvider";
import { ROUTES } from "../lib/routes";
import { useToast } from "../lib/toast/ToastProvider";

const CODE_PARAMETER_NAME = "code";

export default function LoginCallbackPage() {
  const [oauthCode, setOauthCode] = useState<string>();

  const { setSignInStatus } = useAuthProvider();
  const { isLoading: isLoadingAuthTokens, refetch: fetchAuthTokens } =
    useAuthTokens(oauthCode);
  const { connectionStatus, sendMessage } = useConnectionProvider();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    function init() {
      const url = new URL(window.location.href);
      const queryCode = url.searchParams.get(CODE_PARAMETER_NAME)?.trim();

      if (queryCode) {
        /**
         * Remove the code from history for safety.
         */
        url.searchParams.delete(CODE_PARAMETER_NAME);
        window.history.replaceState({}, "", url);

        setOauthCode(queryCode);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (connectionStatus !== "connected" || !oauthCode) return;

    async function getTokens() {
      setSignInStatus("signingIn");

      const result = await fetchAuthTokens();

      if (result.isError) {
        showToast(`Error getting tokens: ${result.error.message}`, "danger");
      }

      if (result.isSuccess) {
        const successMessage = createWebAppMessage(
          "authUpdateTokens",
          result.data
        );
        sendMessage(successMessage);

        redirectAway();
      }
    }

    getTokens();
  }, [connectionStatus, oauthCode]);

  const redirectAway = () => {
    navigate(ROUTES.HOME, {
      replace: true,
    });
  };

  if (isLoadingAuthTokens) {
    return (
      <Stack
        maxWidth="md"
        sx={{
          alignItems: "center",
          gap: 4,
          py: { xs: 8, md: 15 },
          mx: "auto",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Signing you in...
        </Typography>
        <CircularProgress size={48} />
      </Stack>
    );
  }

  return false;
}
