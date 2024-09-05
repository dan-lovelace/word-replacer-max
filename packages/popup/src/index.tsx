import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { POPUP_ROUTES } from "@worm/shared/src/browser";
import "@worm/shared/vite-env.d.ts";

import ToastContainer from "./components/alert/ToastContainer";
import Layout from "./containers/Layout";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import { ConfigProvider } from "./store/Config";

import "./style/index.scss";
import "material-icons/iconfont/sharp.scss";

export function App() {
  return (
    <>
      <ConfigProvider>
        <LocationProvider>
          <Layout>
            <Router>
              <Route path={POPUP_ROUTES.HOME} component={HomePage} />
              <Route default component={NotFoundPage} />
            </Router>
          </Layout>
          <ToastContainer />
        </LocationProvider>
      </ConfigProvider>
    </>
  );
}

render(<App />, document.getElementById("app") as HTMLElement);
