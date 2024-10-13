import Box from "@mui/material/Box/Box";
import Chip from "@mui/material/Chip/Chip";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Divider from "@mui/material/Divider/Divider";
import IconButton from "@mui/material/IconButton/IconButton";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography/Typography";

import chromeLogo from "../../assets/chromeLogo";
import firefoxLogo from "../../assets/firefoxLogo";
import { useAuthProvider } from "../../lib/auth/AuthProvider";
import { useConnectionProvider } from "../../lib/connection/ConnectionProvider";

import Link from "../link/Link";

export default function ConnectionStatus() {
  const { signInStatus } = useAuthProvider();
  const { connectionStatus } = useConnectionProvider();
  const { palette } = useTheme();

  if (connectionStatus === "connected") {
    return (
      <>
        <Tooltip title="Browser extension connected">
          <Box
            className="material-icons-sharp"
            component="span"
            sx={{
              color: palette.success.main,
              cursor: "default",
              pl: "5px",
              pr: signInStatus === "signedIn" ? "5px" : "8px",
            }}
          >
            check_circle
          </Box>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      </>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <Tooltip title="Trying to connect to browser extension">
        <Chip
          color="info"
          icon={
            <Stack
              sx={{
                alignItems: "center",
                backgroundColor: palette.background.default,
                borderRadius: "100%",
                height: 20,
                justifyContent: "center",
                marginLeft: "7px !important",
                marginRight: "-4px !important",
                width: 20,
              }}
            >
              <CircularProgress color="info" size={12} />
            </Stack>
          }
          label="Connecting"
          sx={{
            userSelect: "none",
          }}
        />
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip
        title="Browser extension not connected"
        sx={{ display: "block" }}
      >
        <Box
          className="material-icons-sharp"
          component="span"
          sx={{ color: palette.error.main, cursor: "default", px: "5px" }}
        >
          cancel
        </Box>
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, pl: "5px" }}>
        <Typography sx={{ pl: "2px" }}>Install for</Typography>
        <Link to="https://chromewebstore.google.com/detail/word-replacer-max/gnemoflnihonmkiacnagnbnlppkamfgo">
          <IconButton
            title="Chrome"
            size="small"
            sx={{ height: 32, p: 0.5, width: 32 }}
          >
            {chromeLogo}
          </IconButton>
        </Link>
        <Link to="https://addons.mozilla.org/en-US/firefox/addon/word-replacer-max">
          <IconButton
            title="Firefox"
            size="small"
            sx={{ height: 32, p: 0.5, width: 32 }}
          >
            {firefoxLogo}
          </IconButton>
        </Link>
      </Stack>
    </>
  );
}
