import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Grid2 from "@mui/material/Grid2/Grid2";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import { getEnvConfig } from "@worm/shared/src/config";

import Button from "../components/button/Button";
import Feature from "../components/feature/Feature";
import NewsletterSignup from "../components/form/NewsletterSignup";
import Link from "../components/link/Link";
import UserReviews from "../components/user-reviews/UserReviews";
import Hero from "../containers/Hero";

type StoreLinkProps = {
  imageSrc: string;
  text: string;
  to: string;
};

const envConfig = getEnvConfig();

function StoreLink({ imageSrc, text, to }: StoreLinkProps) {
  return (
    <Link tabIndex={-1} to={to}>
      <Button
        color="primary"
        size="large"
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
              fontWeight: 600,
            }}
          >
            Make the web speak your language
          </Typography>
          <Container>
            <Typography variant="h6" sx={{ maxWidth: 680, mb: 8, mx: "auto" }}>
              The browser extension that lets you customize web content in
              seconds. Simple setup, powerful features, proven by thousands of
              daily users.
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
                to={envConfig.VITE_EXTENSION_STORE_URL_CHROME}
              />
            </Grid2>
            <Grid2
              offset={{ xs: 1, sm: 2, md: 0 }}
              size={{ xs: 10, sm: 8, md: 4 }}
            >
              <StoreLink
                imageSrc="/preload/firefox-logo.svg"
                text="Firefox"
                to={envConfig.VITE_EXTENSION_STORE_URL_FIREFOX}
              />
            </Grid2>
          </Grid2>
        </Container>
      </Hero>

      <Feature
        heading="Personalized replacement rules"
        imgSrc="/screens-rules.png"
        subheading="Match by case, whole word and regular expression"
      />
      <Feature
        heading="AI replacement suggestions"
        imgSrc="/screens-ai-suggestions.png"
        subheading="Leverage the power of AI to get replacement inspiration in your chosen style"
      />
      <Feature
        heading="Flexible domain settings"
        imgSrc="/screens-domains.png"
        subheading="Choose where replacements occur with site-specific control"
      />
      <Feature
        heading="Shareable rulesets"
        imgSrc="/screens-share.png"
        subheading="Share your rules with friends and teammates"
      />

      <Hero>
        <Container>
          <UserReviews />
        </Container>
      </Hero>

      <Hero>
        <Container>
          <NewsletterSignup />
        </Container>
      </Hero>
    </>
  );
}
