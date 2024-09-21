import Box from "@mui/material/Box/Box";

import LayoutHeader from "../components/header/LayoutHeader";

type LayoutProps = React.HTMLAttributes<HTMLDivElement>;

export default function Layout({ children }: LayoutProps) {
  return (
    <Box
      id="layout"
      sx={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
      }}
    >
      <LayoutHeader />
      <Box component="main" sx={{ flex: "1 1 auto" }}>
        {children}
      </Box>
      <Box
        component="footer"
        sx={{
          px: 2,
          py: 1,
          textAlign: "center",
        }}
      >
        Copyright &copy; 2024 Logic Now LLC, All Rights Reserved
      </Box>
    </Box>
  );
}
