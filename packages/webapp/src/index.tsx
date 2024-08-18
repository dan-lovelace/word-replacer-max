import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import "material-icons/iconfont/sharp.scss";

import "./style/index.scss";

import Layout from "./containers/Layout";
import { ROUTES } from "./lib/routes";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

export function App() {
  return (
    <LocationProvider>
      <Layout>
        <Router>
          <Route path={ROUTES.HOME} component={HomePage} />
          <Route path={ROUTES.LOGIN} component={LoginPage} />
          <Route default component={NotFoundPage} />
        </Router>
      </Layout>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app") as HTMLElement);
