import { VNode, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

import { Toast as BSToast } from "bootstrap";

import cx from "../lib/classnames";

type PopupToast = {
  hideToast: () => void;
  showToast: (message: PopupToastMessage) => void;
};

type PopupToastMessage = {
  children: VNode | string;
};

const AUTOHIDE_DELAY_MS = 3000;
const defaultToast = {
  hideToast: () => undefined,
  showToast: () => undefined,
};

export const Toast = createContext<PopupToast>(defaultToast);

export const useToast = () => useContext(Toast);

export function ToastProvider({ children }: { children: VNode }) {
  const [messages, setMessages] = useState<PopupToastMessage[]>();
  const [toast, setToast] = useState<BSToast>();

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

  const hideToast = () => {
    const isShown = toast?.isShown();
    if (isShown) {
      toast?.dispose();
    }

    const toastEl = document.querySelector(".toast");
    if (!toastEl) return;

    new BSToast(toastEl, {
      autohide: true,
      delay: AUTOHIDE_DELAY_MS,
    }).hide();
  };

  const showToast = (message: PopupToastMessage) => {
    const isShown = toast?.isShown();

    if (isShown) {
      toast?.dispose();
    }

    const toastEl = document.querySelector(".toast");
    if (!toastEl) return;

    const initialToast = new BSToast(toastEl, {
      autohide: true,
      delay: AUTOHIDE_DELAY_MS,
      animation: !isShown,
    });
    initialToast?.show();

    setToast(initialToast);
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
