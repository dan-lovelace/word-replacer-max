import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "material-icons/iconfont/sharp.scss";

import "@worm/shared/vite-env.d.ts";

import { App } from "./App";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { ConnectionProvider } from "./lib/connection/ConnectionProvider";
import { QueryProvider } from "./lib/query/QueryProvider";
import { ToastProvider } from "./lib/toast/ToastProvider";
import "./style/index.scss";

createRoot(document.getElementById("app") as HTMLDivElement).render(
  <StrictMode>
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <ConnectionProvider>
            <App />
          </ConnectionProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  </StrictMode>
);