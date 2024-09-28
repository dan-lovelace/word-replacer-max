import Box from "@mui/material/Box/Box";
import Paper from "@mui/material/Paper/Paper";
import Stack from "@mui/material/Stack/Stack";
import Typography from "@mui/material/Typography/Typography";

import { useAuthProvider } from "../../lib/auth/AuthProvider";
import { useConnectionProvider } from "../../lib/connection/ConnectionProvider";
import { ROUTES } from "../../lib/routes";

import CurrentUser from "../auth/CurrentUser";
import LoginButton from "../button/LoginButton";
import SignupButton from "../button/SignupButton";
import ConnectionStatus from "../connection/ConnectionStatus";
import Link from "../link/Link";

export default function LayoutHeader() {
  const { signInStatus } = useAuthProvider();
  const { connectionStatus } = useConnectionProvider();

  return (
    <Paper
      component="header"
      sx={{
        alignItems: "center",
        display: "flex",
        gap: 1,
        px: 2,
        py: 1,
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", flex: "1 1 auto", gap: 1 }}
      >
        <Link to={ROUTES.HOME}>
          <Box
            sx={{
              height: 36,
              p: 0.25,
            }}
          >
            <Box
              component="img"
              alt="Word Replacer Max logo"
              src="/logo_128.png"
              sx={{
                height: "100%",
              }}
            />
          </Box>
        </Link>
        <Typography
          variant="h5"
          sx={{
            display: { xs: "none", sm: "unset" },
            fontWeight: "700",
            mt: 0.25,
          }}
        >
          Word Replacer Max
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
        <ConnectionStatus />
        {connectionStatus === "connected" && (
          <>
            {signInStatus === "signedIn" && <CurrentUser />}
            {signInStatus === "signedOut" && (
              <>
                <LoginButton />
                <SignupButton />
              </>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
