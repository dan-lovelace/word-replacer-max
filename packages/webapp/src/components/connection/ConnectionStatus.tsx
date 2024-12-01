import { useEffect } from "react";

import Box from "@mui/material/Box/Box";
import Divider from "@mui/material/Divider/Divider";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Tooltip from "@mui/material/Tooltip/Tooltip";

import { getEnvConfig } from "@worm/shared/src/config";

import chromeLogo from "../../assets/chromeLogo";
import firefoxLogo from "../../assets/firefoxLogo";
import { useAuthProvider } from "../../lib/auth/AuthProvider";
import { useConnectionProvider } from "../../lib/connection/ConnectionProvider";

import MaterialIcon from "../icon/MaterialIcon";
import Link from "../link/Link";

const envConfig = getEnvConfig();

export default function ConnectionStatus() {
  const { signInStatus, setSignInStatus } = useAuthProvider();
  const { connectionStatus } = useConnectionProvider();
  const { palette } = useTheme();

  useEffect(() => {
    if (connectionStatus === "connected" || connectionStatus === "connecting") {
      return;
    }

    /**
     * Connection status has settled and is not connected.
     */
    setSignInStatus("signedOut");
  }, [connectionStatus]);

  if (connectionStatus === "connected") {
    return (
      <>
        <Tooltip title="Browser extension connected">
          <MaterialIcon
            sx={{
              color: palette.success.main,
              cursor: "default",
              pl: "5px",
              pr: signInStatus === "signedIn" ? "5px" : "8px",
            }}
          >
            check_circle
          </MaterialIcon>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      </>
    );
  }

  if (connectionStatus === "connecting") {
    return <></>;
  }

  return (
    <>
      <Tooltip title="Browser extension not connected">
        <MaterialIcon
          sx={{
            color: palette.error.main,
            cursor: "default",
            px: "5px",
          }}
        >
          cancel
        </MaterialIcon>
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      <Stack direction="row" sx={{ alignItems: "center", gap: 2, pl: "7px" }}>
        <Tooltip title="Get for Chrome">
          <Box>
            <Link
              to={envConfig.VITE_EXTENSION_STORE_URL_CHROME}
              sx={{
                color: "text.primary",
                display: "block",
                height: 24,
                width: 24,
              }}
            >
              {chromeLogo}
            </Link>
          </Box>
        </Tooltip>
        <Tooltip title="Get for Firefox">
          <Box>
            <Link
              to={envConfig.VITE_EXTENSION_STORE_URL_FIREFOX}
              sx={{
                color: "text.primary",
                display: "block",
                height: 24,
                width: 24,
              }}
            >
              {firefoxLogo}
            </Link>
          </Box>
        </Tooltip>
      </Stack>
    </>
  );
}
