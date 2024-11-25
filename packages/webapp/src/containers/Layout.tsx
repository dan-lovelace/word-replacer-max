import Box from "@mui/material/Box/Box";

import LayoutFooter from "../components/footer/LayoutFooter";
import LayoutHeader from "../components/header/LayoutHeader";

type LayoutProps = React.HTMLAttributes<HTMLDivElement>;

export default function Layout({ children }: LayoutProps) {
  return (
    <Box
      id="layout"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 1,
      }}
    >
      <LayoutHeader />
      <Box component="main" sx={{ flex: "1 1 auto" }}>
        {children}
      </Box>
      <LayoutFooter />
    </Box>
  );
}
