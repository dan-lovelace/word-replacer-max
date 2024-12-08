import Box from "@mui/material/Box/Box";
import { ButtonOwnProps } from "@mui/material/Button/Button";
import Container from "@mui/material/Container/Container";
import Grid2 from "@mui/material/Grid2/Grid2";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import { getEnvConfig } from "@worm/shared/src/config";

import Button from "../components/button/Button";
import Features from "../components/feature/Features";
import NewsletterSignup from "../components/form/NewsletterSignup";
import Link from "../components/link/Link";
import UserReviews from "../components/user-reviews/UserReviews";
import Hero from "../containers/Hero";

type StoreLinkProps = {
  imageSrc: string;
  text: string;
  to: string;
};

type StoreLinksProps = {
  buttonProps?: ButtonOwnProps;
  noLines?: boolean;
};

const envConfig = getEnvConfig();

function StoreLink({ imageSrc, text, to, ...rest }: StoreLinkProps) {
  return (
    <Link tabIndex={-1} to={to}>
      <Button variant="outlined" {...rest} sx={{ py: 1, width: 1 }}>
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

function StoreLinks({ buttonProps, noLines = false }: StoreLinksProps) {
  const { palette } = useTheme();

  return (
    <Grid2 container spacing={2}>
      {!noLines && (
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
      )}
      <Grid2 offset={{ xs: 1, sm: 2, md: 2 }} size={{ xs: 10, sm: 8, md: 4 }}>
        <StoreLink
          imageSrc="/chrome-logo.svg"
          text="Chrome"
          to={envConfig.VITE_EXTENSION_STORE_URL_CHROME}
          {...buttonProps}
        />
      </Grid2>
      <Grid2 offset={{ xs: 1, sm: 2, md: 0 }} size={{ xs: 10, sm: 8, md: 4 }}>
        <StoreLink
          imageSrc="/firefox-logo.svg"
          text="Firefox"
          to={envConfig.VITE_EXTENSION_STORE_URL_FIREFOX}
          {...buttonProps}
        />
      </Grid2>
    </Grid2>
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
            <Typography variant="h6" sx={{ maxWidth: 660, mb: 8, mx: "auto" }}>
              A browser extension that automatically replaces text across
              websites as you browse. Visit the extension store to get started
              today.
            </Typography>
          </Container>
          <Typography
            gutterBottom
            variant="subtitle2"
            sx={{ color: "text.secondary" }}
          >
            Select your browser of choice
          </Typography>
          <StoreLinks />
        </Container>
      </Hero>

      <Container>
        <Features />
      </Container>

      <Hero>
        <Container>
          <UserReviews />
        </Container>
      </Hero>

      <Hero sx={{ backgroundColor: palette.grey[900] }}>
        <Container sx={{ textAlign: "center" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
              Ready to get started?
            </Typography>
            <Typography variant="h6">
              Visit the extension store today
            </Typography>
          </Box>
          <StoreLinks noLines />
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
