import "@worm/shared/vite-env.d.ts";
import "./style/index.scss";
import "material-icons/iconfont/sharp.scss";

import { render } from "preact";
import { LocationProvider, Route, Router } from "preact-iso";

import { POPUP_ROUTES } from "@worm/shared/src/browser";

import ToastContainer from "./components/alert/ToastContainer";
import Layout from "./containers/Layout";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import { AuthProvider } from "./store/Auth";
import { ConfigProvider } from "./store/Config";
import { QueryProvider } from "./store/Query";

export function App() {
  return (
    <>
      <ConfigProvider>
        <QueryProvider>
          <AuthProvider>
            <LocationProvider>
              <Layout>
                <Router>
                  <Route path={POPUP_ROUTES.HOME} component={HomePage} />
                  <Route default component={NotFoundPage} />
                </Router>
              </Layout>
              <ToastContainer />
            </LocationProvider>
          </AuthProvider>
        </QueryProvider>
      </ConfigProvider>
    </>
  );
}

render(<App />, document.getElementById("app") as HTMLElement);
