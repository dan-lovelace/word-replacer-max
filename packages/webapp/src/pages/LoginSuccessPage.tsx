import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Grow from "@mui/material/Grow/Grow";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import Link from "../components/link/Link";
import Hero from "../containers/Hero";
import { ROUTES } from "../lib/routes";

const REDIRECT_TIMEOUT_SECONDS = 18;

export default function LoginSuccessPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [_, setSecondsLeft] = useState(REDIRECT_TIMEOUT_SECONDS);

  const navigate = useNavigate();
  const { palette } = useTheme();

  useEffect(() => {
    setIsVisible(true);

    const redirectTimer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          navigate(ROUTES.HOME, { replace: true });
          clearInterval(redirectTimer);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(redirectTimer);
  }, []);

  return (
    <Grow in={isVisible}>
      <Hero>
        <Stack
          maxWidth="md"
          sx={{
            alignItems: "center",
            mx: "auto",
            textAlign: "center",
          }}
        >
          <Typography
            component="h1"
            gutterBottom
            variant="h2"
            sx={{ fontWeight: "bold" }}
          >
            Sign in success
          </Typography>
          <Box
            className="material-icons-sharp"
            component="span"
            sx={{
              color: palette.success.dark,
              mb: { xs: 2, md: 4 },
            }}
          >
            <Box
              component="img"
              src="/preload/popper.png"
              sx={{ width: { xs: 84, md: 128 } }}
            />
          </Box>
          <Container maxWidth="sm">
            <Typography variant="h6" sx={{ fontSize: 18, mb: 5 }}>
              You've successfully signed in to the extension.
            </Typography>
            <Typography gutterBottom variant="body2">
              Returning to homepage in a moment...
            </Typography>
            <Typography variant="body2">
              <Link to={ROUTES.HOME} replace={true}>
                Skip waiting and go now
              </Link>
            </Typography>
          </Container>
        </Stack>
      </Hero>
    </Grow>
  );
}
