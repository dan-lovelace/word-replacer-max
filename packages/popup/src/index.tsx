import "@worm/shared/vite-env.d.ts";
import "./style/index.scss";
import "material-icons/iconfont/sharp.scss";

import { render } from "preact";
import { LocationProvider, Route, Router } from "preact-iso";
import { useEffect, useState } from "preact/hooks";

import { POPUP_ROUTES } from "@worm/shared/src/browser";
import {
  getCurrentColorMode,
  updateDocumentColorMode,
} from "@worm/shared/src/color";

import ToastContainer from "./components/alert/ToastContainer";
import Layout from "./containers/Layout";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import { ConfigProvider, useConfig } from "./store/Config";
import { QueryProvider } from "./store/Query";

export function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    storage: {
      local: { colorMode },
    },
  } = useConfig();

  useEffect(() => {
    async function initialize() {
      updateDocumentColorMode(getCurrentColorMode(colorMode));
      setIsInitialized(true);
    }

    initialize();
  }, []);

  if (!isInitialized) {
    return <></>;
  }

  return (
    <>
      <QueryProvider>
        <LocationProvider>
          <Layout>
            <Router>
              <Route path={POPUP_ROUTES.HOME} component={HomePage} />
              <Route default component={NotFoundPage} />
            </Router>
          </Layout>
          <ToastContainer />
        </LocationProvider>
      </QueryProvider>
    </>
  );
}

render(
  <ConfigProvider>
    <App />
  </ConfigProvider>,
  document.getElementById("app") as HTMLElement
);
