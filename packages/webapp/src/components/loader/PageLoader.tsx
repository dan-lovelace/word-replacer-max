import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Stack from "@mui/material/Stack/Stack";
import Typography from "@mui/material/Typography/Typography";

import Hero from "../../containers/Hero";

type PageLoaderProps = {
  heading: string;
};

export default function PageLoader({ heading }: PageLoaderProps) {
  return (
    <Hero>
      <Stack
        maxWidth="md"
        sx={{
          alignItems: "center",
          gap: 4,
          mx: "auto",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {heading}
        </Typography>
        <CircularProgress size={48} />
      </Stack>
    </Hero>
  );
}
