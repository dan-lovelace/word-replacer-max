import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Paper from "@mui/material/Paper/Paper";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import { ROUTES } from "../../lib/routes";

import Link from "../link/Link";

export default function LayoutFooter() {
  const { palette } = useTheme();

  return (
    <Paper component="footer" sx={{ backgroundColor: palette.grey[50] }}>
      <Container>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            color: palette.text.secondary,
            gap: 2,
            py: 3,
          }}
        >
          <Box sx={{ flex: "1 1 auto" }}>
            <Typography variant="body2">
              Copyright &copy; 2024 Logic Now LLC, All Rights Reserved
            </Typography>
          </Box>
          <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
            <Link to={ROUTES.TERMS}>
              <Typography variant="body2">Terms</Typography>
            </Link>
            <Link to={ROUTES.PRIVACY}>
              <Typography variant="body2">Privacy</Typography>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Paper>
  );
}
