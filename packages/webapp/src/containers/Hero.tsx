import Box from "@mui/material/Box/Box";

type HeroProps = React.HTMLAttributes<HTMLDivElement>;

export default function Hero({ children }: HeroProps) {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 15 },
      }}
    >
      {children}
    </Box>
  );
}
