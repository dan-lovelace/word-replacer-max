import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

import { Toast as BSToast } from "bootstrap";

import cx from "../lib/classnames";
import { PreactChildren } from "../lib/types";

type ToastStore = {
  hideToast: () => void;
  showToast: (message: ToastMessage) => void;
};

type ToastMessage = {
  children: PreactChildren;
};

const AUTOHIDE_DELAY_MS = 3000;

const storeDefaults = {
  hideToast: () => undefined,
  showToast: () => undefined,
};

const Toast = createContext<ToastStore>(storeDefaults);

export const useToast = () => useContext(Toast);

export function ToastProvider({ children }: { children: PreactChildren }) {
  const [messages, setMessages] = useState<ToastMessage[]>();

  useEffect(() => {
    const hideListener = () => {
      setMessages(undefined);
    };

    const toastEl = document.querySelector(".toast");

    toastEl?.addEventListener("hidden.bs.toast", hideListener);
    return () => {
      toastEl?.removeEventListener("hidden.bs.toast", hideListener);
    };
  }, []);

  const disposeToast = () => {
    getToast()?.dispose();
  };

  const getToast = () => {
    const toastEl = document.querySelector(".toast");

    if (!toastEl) return;

    return new BSToast(toastEl, {
      autohide: true,
      delay: AUTOHIDE_DELAY_MS,
    });
  };

  const hideToast = () => {
    disposeToast();
  };

  const showToast = (message: ToastMessage) => {
    const currentToast = getToast();
    const isCurrentToastShown = currentToast?.isShown();

    if (currentToast) {
      disposeToast();
    }

    const toastEl = document.querySelector(".toast");
    if (!toastEl) return;

    const initialToast = new BSToast(toastEl, {
      autohide: true,
      delay: AUTOHIDE_DELAY_MS,
      animation: !isCurrentToastShown,
    });
    initialToast?.show();

    setMessages([message]);
  };

  return (
    <Toast.Provider value={{ hideToast, showToast }}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className={cx(
          "toast align-items-center",
          "text-bg-light",
          "position-fixed end-0 bottom-0 w-auto",
          "me-1 mb-1",
          "z-toast"
        )}
        role="alert"
      >
        <div className="d-flex">
          <div className="toast-body px-3">{messages?.[0].children}</div>
        </div>
      </div>
    </Toast.Provider>
  );
}
