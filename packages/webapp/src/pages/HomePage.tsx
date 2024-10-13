import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Grid2 from "@mui/material/Grid2/Grid2";
import Typography from "@mui/material/Typography/Typography";

import chromeSvg from "../assets/chrome-logo.svg";
import firefoxSvg from "../assets/firefox-logo.svg";
import Button from "../components/button/Button";
import Link from "../components/link/Link";

type StoreLinkProps = {
  imageSrc: string;
  text: string;
  to: string;
};

function StoreLink({ imageSrc, text, to }: StoreLinkProps) {
  return (
    <Link to={to}>
      <Button variant="outlined" color="primary" size="large" sx={{ width: 1 }}>
        <img src={imageSrc} />
        <Typography
          sx={{
            fontSize: "1.35rem",
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
      <Box
        sx={{
          py: { xs: 8, md: 15 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            component="h1"
            gutterBottom
            variant="h2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Powerful text replacement to personalize your web content
          </Typography>
          <Container maxWidth="sm">
            <Typography component="h2" sx={{ fontSize: 18, mb: 5, mx: "auto" }}>
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
                imageSrc={chromeSvg}
                text="Chrome"
                to="https://chromewebstore.google.com/detail/word-replacer-max/gnemoflnihonmkiacnagnbnlppkamfgo"
              />
            </Grid2>
            <Grid2
              offset={{ xs: 3, sm: 3, md: 0 }}
              size={{ xs: 6, sm: 6, md: 3 }}
            >
              <StoreLink
                imageSrc={firefoxSvg}
                text="Firefox"
                to="https://addons.mozilla.org/en-US/firefox/addon/word-replacer-max"
              />
            </Grid2>
          </Grid2>
        </Container>
      </Box>
    </>
  );
}
