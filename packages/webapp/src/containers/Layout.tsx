import Box from "@mui/material/Box/Box";

import { cx } from "@worm/shared";

import LoginButton from "../components/button/LoginButton";
import SignupButton from "../components/button/SignupButton";
import ConnectionStatus from "../components/connection/ConnectionStatus";
import { ROUTES } from "../lib/routes";
import Link from "../components/link/Link";

type LayoutProps = React.HTMLAttributes<HTMLDivElement>;

const navigation = [
  {
    id: "home",
    label: "Home",
    to: ROUTES.HOME,
  },
];

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
      <Box
        component="header"
        sx={{
          alignItems: "center",
          display: "flex",
          gap: 1,
          px: 2,
          py: 1,
        }}
      >
        <Link to={ROUTES.HOME}>
          <Box
            sx={{
              height: 36,
              p: 1,
            }}
          >
            <Box
              component="img"
              alt="Word Replacer Max logo"
              src="/logo_128.png"
              sx={{
                height: "100%",
              }}
            />
          </Box>
        </Link>
        <Box
          sx={{
            flex: "1 1 auto",
          }}
        >
          {navigation.map((item) => (
            <span key={item.id}>
              <Link to={item.to}>{item.label}</Link>
            </span>
          ))}
        </Box>
        <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
          <ConnectionStatus />
          <LoginButton />
          <SignupButton />
        </Box>
      </Box>
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
