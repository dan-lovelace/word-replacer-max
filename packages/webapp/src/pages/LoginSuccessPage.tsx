import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import Hero from "../containers/Hero";

export default function LoginSuccessPage() {
  const { palette } = useTheme();

  return (
    <>
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
              fontSize: { xs: 64, md: 96 },
              mb: { xs: 5, md: 6 },
            }}
          >
            🎉
          </Box>
          <Container maxWidth="xs">
            <Typography component="h2" sx={{ fontSize: 18, mb: 5 }}>
              You have been signed in to the extension. You may now close this
              window.
            </Typography>
          </Container>
        </Stack>
      </Hero>
    </>
  );
}
