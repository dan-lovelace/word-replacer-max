import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Grid2 from "@mui/material/Grid2/Grid2";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import Button from "../components/button/Button";
import NewsletterSignup from "../components/form/NewsletterSignup";
import Link from "../components/link/Link";
import Hero from "../containers/Hero";

type StoreLinkProps = {
  imageSrc: string;
  text: string;
  to: string;
};

function StoreLink({ imageSrc, text, to }: StoreLinkProps) {
  return (
    <Link to={to}>
      <Button
        color="primary"
        size="large"
        tabIndex={-1}
        variant="outlined"
        sx={{ py: 1, width: 1 }}
      >
        <img src={imageSrc} />
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            ml: { xs: 1, sm: 2 },
          }}
        >
          {text}
        </Typography>
      </Button>
    </Link>
  );
}

export default function HomePage() {
  const { palette } = useTheme();

  return (
    <>
      <Hero>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography
            component="h1"
            gutterBottom
            variant="h2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Make the web speak your language
          </Typography>
          <Container maxWidth="sm">
            <Typography variant="h6" sx={{ mb: 6 }}>
              A browser extension for automatically replacing text on websites.
              Visit the extension store to get started today.
            </Typography>
          </Container>
          <Typography
            gutterBottom
            variant="subtitle2"
            sx={{ color: "text.secondary" }}
          >
            Select your browser of choice
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2
              offset={{ xs: 6, md: 4 }}
              size={{ xs: 12, md: 4 }}
              sx={{ position: "relative" }}
            >
              <Box
                sx={{
                  border: { md: `1px solid ${palette.divider}` },
                  borderBottom: { md: "none" },
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  height: 16,
                  left: "50%",
                  position: "absolute",
                  transform: "translateX(-50%)",
                  width: "calc(100% + 20px)",
                }}
              />
            </Grid2>
            <Grid2
              offset={{ xs: 1, sm: 2, md: 2 }}
              size={{ xs: 10, sm: 8, md: 4 }}
            >
              <StoreLink
                imageSrc="/preload/chrome-logo.svg"
                text="Chrome"
                to="https://chromewebstore.google.com/detail/word-replacer-max/gnemoflnihonmkiacnagnbnlppkamfgo"
              />
            </Grid2>
            <Grid2
              offset={{ xs: 1, sm: 2, md: 0 }}
              size={{ xs: 10, sm: 8, md: 4 }}
            >
              <StoreLink
                imageSrc="/preload/firefox-logo.svg"
                text="Firefox"
                to="https://addons.mozilla.org/en-US/firefox/addon/word-replacer-max"
              />
            </Grid2>
          </Grid2>
        </Container>
      </Hero>

      <Hero>
        <Container sx={{ pb: 8 }}>
          <NewsletterSignup />
        </Container>
      </Hero>
    </>
  );
}
