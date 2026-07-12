import AppBar from "@mui/material/AppBar/AppBar";
import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Stack from "@mui/material/Stack/Stack";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import Typography from "@mui/material/Typography/Typography";

import logo from "../../assets/wrm-logo.png";
import { ROUTES } from "../../lib/routes";

import Link from "../link/Link";

export default function LayoutHeader() {
  return (
    <AppBar component="header" elevation={1} position="sticky">
      <Toolbar disableGutters>
        <Container
          sx={{
            alignItems: "center",
            display: "flex",
            gap: 2,
          }}
        >
          <Stack direction="row" sx={{ flex: "1 1 auto" }}>
            <Link
              to={ROUTES.HOME}
              sx={{
                alignItems: "center",
                display: "flex",
                color: "common.white",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  height: 32,
                  p: 0.25,
                }}
              >
                <Box
                  component="img"
                  alt="Word Replacer Max logo"
                  src={logo}
                  sx={{
                    height: 1,
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  display: { xs: "none", md: "block" },
                  fontWeight: "bold",
                  userSelect: "none",
                }}
              >
                Word Replacer Max
              </Typography>
            </Link>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
