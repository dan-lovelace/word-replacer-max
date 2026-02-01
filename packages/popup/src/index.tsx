import "@worm/shared/vite-env.d.ts";
import "./style/index.scss";
import "material-icons/iconfont/sharp.scss";

import { render } from "preact";
import { LocationProvider, Route, Router } from "preact-iso";
import { useEffect, useState } from "preact/hooks";

import { POPUP_ROUTES } from "@worm/shared/src/browser";
import {
  COLOR_MODE_ATTRIBUTE,
  getSystemColorMode,
} from "@worm/shared/src/color";
import { storageSetByKeys } from "@worm/shared/src/storage";

import ToastContainer from "./components/alert/ToastContainer";
import Layout from "./containers/Layout";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import { AuthProvider } from "./store/Auth";
import { ConfigProvider, useConfig } from "./store/Config";
import { MessageProvider } from "./store/Message";
import { QueryProvider } from "./store/Query";

export function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    storage: {
      local: { colorMode },
      sync: { preferences },
    },
  } = useConfig();

  useEffect(() => {
    async function initialize() {
      /**
       * Always redirect away from the Account tab when loading the app.
       */
      if (preferences?.activeTab === "account") {
        const newPreferences = Object.assign({}, preferences);

        newPreferences.activeTab = "rules";

        await storageSetByKeys({
          preferences: newPreferences,
        });
      }

      if (colorMode) {
        switch (colorMode) {
          case "dark":
          case "light": {
            document.documentElement.setAttribute(
              COLOR_MODE_ATTRIBUTE,
              colorMode
            );
            break;
          }

          case "system": {
            document.documentElement.setAttribute(
              COLOR_MODE_ATTRIBUTE,
              getSystemColorMode()
            );
            break;
          }
        }
      }

      setIsInitialized(true);
    }

    initialize();
  }, []);

  if (!isInitialized) {
    return <></>;
  }

  return (
    <>
      <MessageProvider>
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
      </MessageProvider>
    </>
  );
}

render(
  <ConfigProvider>
    <App />
  </ConfigProvider>,
  document.getElementById("app") as HTMLElement
);
