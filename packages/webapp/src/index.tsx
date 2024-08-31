import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "material-icons/iconfont/sharp.scss";

import "@worm/shared/vite-env.d.ts";

import { App } from "./App";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { ConnectionProvider } from "./lib/connection/ConnectionProvider";
import { StoreProvider } from "./lib/store/StoreProvider";
import { ToastProvider } from "./lib/toast/ToastProvider";
import "./style/index.scss";

createRoot(document.getElementById("app") as HTMLDivElement).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <ConnectionProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ConnectionProvider>
      </ToastProvider>
    </StoreProvider>
  </StrictMode>
);
