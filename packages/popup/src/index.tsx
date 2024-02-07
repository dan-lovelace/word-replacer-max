import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import Layout from "./components/Layout";
import { ROUTES } from "./lib/routes";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import { ConfigProvider } from "./store/Config";

import "./style/index.scss";
import "material-icons/iconfont/sharp.scss";

export function App() {
  return (
    <ConfigProvider>
      <LocationProvider>
        <Layout>
          <Router>
            <Route path={ROUTES.HOME} component={HomePage} />
            <Route default component={NotFoundPage} />
          </Router>
        </Layout>
      </LocationProvider>
    </ConfigProvider>
  );
}

render(<App />, document.getElementById("app") as HTMLElement);
