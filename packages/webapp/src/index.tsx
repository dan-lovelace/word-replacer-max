import "material-icons/iconfont/sharp.scss";
import "@worm/shared/vite-env.d.ts";
import "./style/index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { QueryProvider } from "./lib/query/QueryProvider";
import { ToastProvider } from "./lib/toast/ToastProvider";

createRoot(document.getElementById("app") as HTMLDivElement).render(
  <StrictMode>
    <QueryProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryProvider>
  </StrictMode>
);
