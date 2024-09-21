import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box/Box";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Typography from "@mui/material/Typography/Typography";

import { createWebAppMessage } from "@worm/shared";

import { useAuthTokens } from "../lib/auth/queries";
import { useConnectionProvider } from "../lib/connection/ConnectionProvider";
import { ROUTES } from "../lib/routes";
import { useToast } from "../lib/toast/ToastProvider";

const CODE_PARAMETER_NAME = "code";

export default function LoginCallbackPage() {
  const [oauthCode, setOauthCode] = useState<string>();

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
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 2,
          height: "100%",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Signing in...
        </Typography>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return false;
}
