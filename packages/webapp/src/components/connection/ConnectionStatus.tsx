import Chip from "@mui/material/Chip/Chip";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import IconButton from "@mui/material/IconButton/IconButton";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography/Typography";

import chromeLogo from "../../assets/chromeLogo";
import firefoxLogo from "../../assets/firefoxLogo";
import { useConnectionProvider } from "../../lib/connection/ConnectionProvider";

import Link from "../link/Link";

export default function ConnectionStatus() {
  const { connectionStatus } = useConnectionProvider();
  const { palette } = useTheme();

  if (connectionStatus === "connected") {
    return (
      <Tooltip title="Browser extension connected">
        <Chip
          color="success"
          icon={<span className="material-icons-sharp">check_circle</span>}
          label="Connected"
          sx={{
            userSelect: "none",
          }}
        />
      </Tooltip>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <Tooltip title="Trying to connect with browser extension">
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
      <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
        <Typography>Available for</Typography>
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
      <Tooltip
        title="Install the browser extension for the best experience"
        sx={{ display: "block", mr: 3 }}
      >
        <Chip
          color="error"
          icon={<span className="material-icons-sharp">cancel</span>}
          label="Not connected"
          sx={{
            userSelect: "none",
          }}
        />
      </Tooltip>
    </>
  );
}
