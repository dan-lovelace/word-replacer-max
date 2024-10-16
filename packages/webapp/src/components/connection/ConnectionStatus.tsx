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

import MaterialIcon from "../icon/MaterialIcon";
import Link from "../link/Link";

export default function ConnectionStatus() {
  const { signInStatus } = useAuthProvider();
  const { connectionStatus } = useConnectionProvider();
  const { palette } = useTheme();

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
      <Tooltip
        title="Browser extension not connected"
        sx={{ display: "block" }}
      >
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
