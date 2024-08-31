import { BrowserRouter, Route, Routes } from "react-router-dom";

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
import { muiTheme } from "./style/mui-theme";

const theme = createTheme(muiTheme);

export function App() {
  const { appUser } = useAuthProvider();
  const { isConnected } = useConnectionProvider();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <div>
          <p>USER: {appUser ? JSON.stringify(appUser, null, 2) : "unknown"}</p>
          <p>IS_CONNECTED: {JSON.stringify(isConnected, null, 2)}</p>
        </div>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route
              path={ROUTES.LOGIN_CALLBACK}
              element={<LoginCallbackPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </Layout>
    </ThemeProvider>
  );
}
