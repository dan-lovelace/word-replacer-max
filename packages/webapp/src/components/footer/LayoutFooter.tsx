import Container from "@mui/material/Container/Container";
import Divider from "@mui/material/Divider/Divider";
import Grid2 from "@mui/material/Grid2/Grid2";
import Paper from "@mui/material/Paper/Paper";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import { getEnvConfig } from "@worm/shared/src/config";
import {
  MAILTO_CONTACT_GENERAL_EMAIL,
  PUBLIC_GITHUB_REPOSITORY_URL,
} from "@worm/shared/src/support";

import githubLogo from "../../assets/githubLogo";
import { ROUTES } from "../../lib/routes";

import Link from "../link/Link";

const envConfig = getEnvConfig();

export default function LayoutFooter() {
  const { palette } = useTheme();

  return (
    <Paper component="footer" square sx={{ color: palette.text.secondary }}>
      <Container sx={{ py: 3 }}>
        <Grid2
          container
          spacing={{ xs: 4, md: 2 }}
          sx={{
            alignItems: "center",
            flexWrap: { xs: "wrap-reverse", md: "unset" },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Typography variant="body2">
              Copyright &copy; {envConfig.VITE_COPYRIGHT_YEAR} Word Replacer
              Max, LLC, All rights reserved
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: { xs: "center", md: "end" },
                gap: 2,
              }}
            >
              <Link
                to={PUBLIC_GITHUB_REPOSITORY_URL}
                target="_blank"
                sx={{ color: palette.text.primary, height: 24, width: 24 }}
              >
                {githubLogo}
              </Link>
              <Divider orientation="vertical" flexItem />
              <Link to={MAILTO_CONTACT_GENERAL_EMAIL}>
                <Typography variant="body2">Contact</Typography>
              </Link>
              <Divider orientation="vertical" flexItem />
              <Link to={ROUTES.TERMS}>
                <Typography variant="body2">Terms</Typography>
              </Link>
              <Divider orientation="vertical" flexItem />
              <Link to={ROUTES.PRIVACY}>
                <Typography variant="body2">Privacy</Typography>
              </Link>
            </Stack>
          </Grid2>
        </Grid2>
      </Container>
    </Paper>
  );
}
