import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { POPUP_ROUTES } from "@worm/shared";

import "bootstrap/js/dist/toast";

import Layout from "./components/Layout";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import { ConfigProvider } from "./store/Config";
import { ToastProvider } from "./store/Toast";

import "./style/index.scss";
import "material-icons/iconfont/sharp.scss";

export function App() {
  return (
    <ConfigProvider>
      <ToastProvider>
        <LocationProvider>
          <Layout>
            <Router>
              <Route path={POPUP_ROUTES.HOME} component={HomePage} />
              <Route default component={NotFoundPage} />
            </Router>
          </Layout>
        </LocationProvider>
      </ToastProvider>
    </ConfigProvider>
  );
}

render(<App />, document.getElementById("app") as HTMLElement);
