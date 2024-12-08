import Box from "@mui/material/Box/Box";
import { ButtonOwnProps } from "@mui/material/Button/Button";
import Grid2 from "@mui/material/Grid2/Grid2";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import { getEnvConfig } from "@worm/shared/src/config";

import chromeLogo from "../../assets/chrome-logo.svg";
import firefoxLogo from "../../assets/firefox-logo.svg";

import Button from "../button/Button";
import Link from "../link/Link";

const envConfig = getEnvConfig();

type StoreLinkProps = {
  imageSrc: string;
  text: string;
  to: string;
};

type StoreLinksProps = {
  buttonProps?: ButtonOwnProps;
  noLines?: boolean;
};

function StoreLink({ imageSrc, text, to, ...rest }: StoreLinkProps) {
  return (
    <Link tabIndex={-1} to={to}>
      <Button variant="contained" {...rest} sx={{ py: 1, width: 1 }}>
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

export default function StoreLinks({
  buttonProps,
  noLines = false,
}: StoreLinksProps) {
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
          imageSrc={chromeLogo}
          text="Chrome"
          to={envConfig.VITE_EXTENSION_STORE_URL_CHROME}
          {...buttonProps}
        />
      </Grid2>
      <Grid2 offset={{ xs: 1, sm: 2, md: 0 }} size={{ xs: 10, sm: 8, md: 4 }}>
        <StoreLink
          imageSrc={firefoxLogo}
          text="Firefox"
          to={envConfig.VITE_EXTENSION_STORE_URL_FIREFOX}
          {...buttonProps}
        />
      </Grid2>
    </Grid2>
  );
}
