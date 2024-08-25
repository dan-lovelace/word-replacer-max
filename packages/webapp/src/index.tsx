import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import "material-icons/iconfont/sharp.scss";

import "@worm/shared/vite-env.d.ts";

import "./style/index.scss";

import Layout from "./containers/Layout";
import { ROUTES } from "./lib/routes";
import { AuthStore, useAuthStore } from "./lib/store/AuthStore";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

export function App() {
  const { appUser } = useAuthStore();

  return (
    <LocationProvider>
      <Layout>
        <div className="absolute bg-white p-2 border right-0">
          <p>USER: {appUser ? JSON.stringify(appUser, null, 2) : "unknown"}</p>
        </div>
        <Router>
          <Route path={ROUTES.HOME} component={HomePage} />
          <Route path={ROUTES.LOGIN} component={LoginPage} />
          <Route default component={NotFoundPage} />
        </Router>
      </Layout>
    </LocationProvider>
  );
}

render(
  <AuthStore>
    <App />
  </AuthStore>,
  document.getElementById("app") as HTMLElement
);
