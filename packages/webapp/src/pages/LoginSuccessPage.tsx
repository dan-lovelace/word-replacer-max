import { useEffect, useState } from "react";

import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Grow from "@mui/material/Grow/Grow";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import Link from "../components/link/Link";
import Hero from "../containers/Hero";
import { ROUTES } from "../lib/routes";

export default function LoginSuccessPage() {
  const [isOpen, setIsOpen] = useState(false);

  const { palette } = useTheme();

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <Grow in={isOpen}>
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
          <Container maxWidth="xs">
            <Typography component="h2" sx={{ fontSize: 18, mb: 5 }}>
              You have been signed in to the extension. You may now close this
              window or <Link to={ROUTES.HOME}>go home</Link>.
            </Typography>
          </Container>
        </Stack>
      </Hero>
    </Grow>
  );
}
