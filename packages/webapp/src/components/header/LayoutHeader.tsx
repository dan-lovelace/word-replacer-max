import { matchPath, useLocation } from "react-router-dom";

import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Paper from "@mui/material/Paper/Paper";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";

import { useAuthProvider } from "../../lib/auth/AuthProvider";
import { useConnectionProvider } from "../../lib/connection/ConnectionProvider";
import { ROUTES } from "../../lib/routes";

import CurrentUser from "../auth/CurrentUser";
import LoginButton from "../button/LoginButton";
import SignupButton from "../button/SignupButton";
import ConnectionStatus from "../connection/ConnectionStatus";
import Link from "../link/Link";

const HEADER_HEIGHT_PX = 54;

const navigation = [
  {
    id: "home",
    label: "Home",
    to: ROUTES.HOME,
  },
];

export default function LayoutHeader() {
  const { signInStatus } = useAuthProvider();
  const { connectionStatus } = useConnectionProvider();
  const { pathname } = useLocation();
  const { palette } = useTheme();

  return (
    <Paper
      component="header"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: palette.divider,
        borderRadius: 0,
        position: "sticky",
        top: 0,
      }}
    >
      <Container
        sx={{
          alignItems: "center",
          display: "flex",
          gap: 1,
          height: HEADER_HEIGHT_PX,
          px: 2,
          py: 1,
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
          <Stack
            component="nav"
            direction="row"
            sx={{
              alignItems: "center",
              height: HEADER_HEIGHT_PX,
              my: -1,
              gap: 2,
            }}
          >
            {navigation.map(({ id, label, to }) => (
              <Link
                key={id}
                to={to}
                sx={{
                  height: 1,
                }}
              >
                <Stack
                  sx={{
                    height: 1,
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {label}
                  <Box
                    sx={{
                      backgroundColor: matchPath(to, pathname)
                        ? palette.primary.main
                        : "transparent",
                      bottom: 0,
                      height: 2,
                      position: "absolute",
                      width: 1,
                    }}
                  />
                </Stack>
              </Link>
            ))}
          </Stack>
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
    </Paper>
  );
}
