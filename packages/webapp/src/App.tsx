import { BrowserRouter, Route, Routes } from "react-router-dom";

import Box from "@mui/material/Box/Box";
import CssBaseline from "@mui/material/CssBaseline";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";

import Layout from "./containers/Layout";
import { useAuthProvider } from "./lib/auth/AuthProvider";
import { useConnectionProvider } from "./lib/connection/ConnectionProvider";
import { ROUTES } from "./lib/routes";
import HomePage from "./pages/HomePage";
import LoginCallbackPage from "./pages/LoginCallbackPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/SignUpPage";
import { muiTheme } from "./style/mui-theme";

const theme = createTheme(muiTheme);

export function App() {
  const { appUser } = useAuthProvider();
  const { isConnected } = useConnectionProvider();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Box
            sx={{ border: 1, p: 1, position: "absolute", right: 0, top: "50%" }}
          >
            <p>
              USER: {appUser ? JSON.stringify(appUser, null, 2) : "unknown"}
            </p>
            <p>IS_CONNECTED: {JSON.stringify(isConnected, null, 2)}</p>
          </Box>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route
              path={ROUTES.LOGIN_CALLBACK}
              element={<LoginCallbackPage />}
            />
            <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
