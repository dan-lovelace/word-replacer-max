import Container from "@mui/material/Container/Container";
import Grid2 from "@mui/material/Grid2/Grid2";
import Typography from "@mui/material/Typography/Typography";

import Button from "../components/button/Button";
import NewsletterSignup from "../components/form/NewsletterSignup";
import Link from "../components/link/Link";
import UserReviews from "../components/user-reviews/UserReviews";
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
        sx={{ width: 1 }}
      >
        <img src={imageSrc} />
        <Typography
          sx={{
            fontSize: "1.35rem",
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
  return (
    <>
      <Hero>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            component="h1"
            gutterBottom
            variant="h2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Powerful text replacement to personalize your web
          </Typography>
          <Container maxWidth="sm">
            <Typography component="h2" sx={{ fontSize: 18, mb: 5 }}>
              A browser extension for automatically replacing words on websites.
              Visit the extension store to get started today.
            </Typography>
          </Container>
          <Grid2 container spacing={2}>
            <Grid2
              offset={{ xs: 3, sm: 3, md: 3 }}
              size={{ xs: 6, sm: 6, md: 3 }}
            >
              <StoreLink
                imageSrc="/preload/chrome-logo.svg"
                text="Chrome"
                to="https://chromewebstore.google.com/detail/word-replacer-max/gnemoflnihonmkiacnagnbnlppkamfgo"
              />
            </Grid2>
            <Grid2
              offset={{ xs: 3, sm: 3, md: 0 }}
              size={{ xs: 6, sm: 6, md: 3 }}
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
      <Container sx={{ pb: 8 }}>
        <UserReviews />
      </Container>
      <NewsletterSignup />
    </>
  );
}
