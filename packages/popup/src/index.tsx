import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/404";
import { ConfigProvider } from "./store/Config";

import "./style/index.scss";
import "material-icons/iconfont/sharp.scss";

export function App() {
  return (
    <ConfigProvider>
      <LocationProvider>
        <Layout>
          <Router>
            <Route path="/popup.html" component={Home} />
            <Route default component={NotFound} />
          </Router>
        </Layout>
      </LocationProvider>
    </ConfigProvider>
  );
}

render(<App />, document.getElementById("app") as HTMLElement);
