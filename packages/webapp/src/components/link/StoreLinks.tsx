import { ReactNode } from "react";

import Box from "@mui/material/Box/Box";
import { ButtonOwnProps } from "@mui/material/Button/Button";
import Grid2 from "@mui/material/Grid2/Grid2";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import { getEnvConfig } from "@worm/shared/src/config";

import chromeLogo from "../../assets/chromeLogo";
import edgeLogo from "../../assets/edgeLogo";
import firefoxLogo from "../../assets/firefoxLogo";

import Button from "../button/Button";
import Link from "../link/Link";

const envConfig = getEnvConfig();

type StoreLinkProps = {
  image: ReactNode;
  text: string;
  to: string;
};

type StoreLinksProps = {
  buttonProps?: ButtonOwnProps;
  noLines?: boolean;
};

function StoreLink({ image, text, to, ...rest }: StoreLinkProps) {
  return (
    <Link tabIndex={-1} to={to}>
      <Button variant="contained" {...rest} sx={{ py: 1, width: 1 }}>
        <Box
          component="span"
          sx={{ alignItems: "center", display: "inline-flex", gap: 2 }}
        >
          <Box
            component="span"
            sx={{
              alignItems: "center",
              display: "inline-flex",
              height: 24,
              width: 24,
            }}
          >
            {image}
          </Box>
          <Typography
            sx={{
              fontSize: "1.20rem",
              fontWeight: 500,
            }}
          >
            {text}
          </Typography>
        </Box>
      </Button>
    </Link>
  );
}

export default function StoreLinks({
  buttonProps,
  noLines = false,
}: StoreLinksProps) {
  const { palette } = useTheme();

  return (
    <>
      <Typography
        gutterBottom
        variant="subtitle2"
        sx={{ color: "text.secondary" }}
      >
        Available for...
      </Typography>
      <Grid2 container spacing={2}>
        {!noLines && (
          <Grid2
            offset={{ xs: 6, md: 0 }}
            size={{ xs: 12 }}
            sx={{ position: "relative" }}
          >
            <Box
              sx={{
                border: { lg: `1px solid ${palette.divider}` },
                borderBottom: { lg: "none" },
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
        <Grid2
          offset={{ xs: 1, sm: 2, lg: 0 }}
          size={{ xs: 10, sm: 8, lg: 4 }}
          sx={{ mt: -1 }}
        >
          <StoreLink
            image={chromeLogo}
            text="Chrome"
            to={envConfig.VITE_EXTENSION_STORE_URL_CHROME}
            {...buttonProps}
          />
        </Grid2>
        <Grid2
          offset={{ xs: 1, sm: 2, lg: 0 }}
          size={{ xs: 10, sm: 8, lg: 4 }}
          sx={{ mt: -1 }}
        >
          <StoreLink
            image={edgeLogo}
            text="Edge"
            to={envConfig.VITE_EXTENSION_STORE_URL_EDGE}
            {...buttonProps}
          />
        </Grid2>
        <Grid2
          offset={{ xs: 1, sm: 2, lg: 0 }}
          size={{ xs: 10, sm: 8, lg: 4 }}
          sx={{ mt: -1 }}
        >
          <StoreLink
            image={firefoxLogo}
            text="Firefox"
            to={envConfig.VITE_EXTENSION_STORE_URL_FIREFOX}
            {...buttonProps}
          />
        </Grid2>
      </Grid2>
    </>
  );
}
