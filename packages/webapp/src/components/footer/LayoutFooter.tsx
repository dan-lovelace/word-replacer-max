import Container from "@mui/material/Container/Container";
import Divider from "@mui/material/Divider/Divider";
import Grid2 from "@mui/material/Grid2/Grid2";
import Paper from "@mui/material/Paper/Paper";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import { ROUTES } from "../../lib/routes";

import Link from "../link/Link";

export default function LayoutFooter() {
  const { palette } = useTheme();

  return (
    <Paper component="footer" square sx={{ color: palette.text.secondary }}>
      <Container sx={{ py: 3 }}>
        <Grid2
          container
          spacing={2}
          sx={{ textAlign: { xs: "center", md: "left" } }}
        >
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Typography variant="body2">
              Copyright &copy; 2024 Logic Now LLC, All rights reserved
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Stack
              direction="row"
              sx={{ justifyContent: { xs: "center", md: "end" }, gap: 2 }}
            >
              <Link to="mailto:hello@wordreplacermax.com">
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
