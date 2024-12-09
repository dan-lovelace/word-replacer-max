import AppBar from "@mui/material/AppBar/AppBar";
import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Stack from "@mui/material/Stack/Stack";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import Typography from "@mui/material/Typography/Typography";

import logo from "../../assets/wrm-logo.png";
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
          <Stack direction="row" sx={{ flex: "1 1 auto" }}>
            <Link
              to={ROUTES.HOME}
              sx={{
                alignItems: "center",
                display: "flex",
                color: "common.white",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  height: 32,
                  p: 0.25,
                }}
              >
                <Box
                  component="img"
                  alt="Word Replacer Max logo"
                  src={logo}
                  sx={{
                    height: 1,
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  display: { xs: "none", md: "block" },
                  fontWeight: "bold",
                  marginTop: "2px",
                  userSelect: "none",
                }}
              >
                Word Replacer Max
              </Typography>
            </Link>
          </Stack>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 1,
              opacity: signInStatus !== "unknown" ? 1 : 0,
              transition: "opacity 90ms ease-out",
            }}
          >
            <ConnectionStatus />
            {connectionStatus === "connected" && (
              <>
                {signInStatus === "signedIn" ? (
                  <CurrentUser />
                ) : (
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
