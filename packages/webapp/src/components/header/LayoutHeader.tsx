import AppBar from "@mui/material/AppBar/AppBar";
import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Stack from "@mui/material/Stack/Stack";
import Toolbar from "@mui/material/Toolbar/Toolbar";
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
    <AppBar component="header" elevation={1} position="sticky">
      <Toolbar disableGutters>
        <Container
          sx={{
            alignItems: "center",
            display: "flex",
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: "center", flex: "1 1 auto", gap: 2 }}
          >
            <Link to={ROUTES.HOME}>
              <Box
                sx={{
                  height: 32,
                  p: 0.25,
                }}
              >
                <Box
                  component="img"
                  alt="Word Replacer Max logo"
                  src="/logo_128.png"
                  sx={{
                    height: 1,
                  }}
                />
              </Box>
            </Link>
            <Typography
              variant="h6"
              sx={{
                display: { xs: "none", md: "block" },
                fontWeight: "bold",
                userSelect: "none",
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
        </Container>
      </Toolbar>
    </AppBar>
  );
}
