import Stack from "@mui/material/Stack/Stack";
import Typography from "@mui/material/Typography/Typography";

import { MAILTO_CONTACT_SUPPORT_URL } from "@worm/shared/src/support";

import Button from "../components/button/Button";
import Link from "../components/link/Link";
import Hero from "../containers/Hero";
import { ROUTES } from "../lib/routes";

export default function NotFoundPage() {
  return (
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
          sx={{ fontWeight: 600 }}
        >
          Page not found
        </Typography>
        <Typography variant="h6" sx={{ mb: 5 }}>
          The page you've landed on does not exist.
        </Typography>
        <Link to={ROUTES.HOME} sx={{ mb: 8 }}>
          <Button size="large" variant="contained">
            Go home
          </Button>
        </Link>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          If you think this is an error on our part, please{" "}
          <Link to={MAILTO_CONTACT_SUPPORT_URL}>contact support</Link>
        </Typography>
      </Stack>
    </Hero>
  );
}
